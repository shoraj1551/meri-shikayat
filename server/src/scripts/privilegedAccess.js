// Offline operator CLI. No HTTP route imports this module; imports never connect.
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createAuditReport, readInventory, validateProvisioning } from '../operations/privilegedAccess.js';

export async function runOperatorCommand(command, input, mongoose) {
    if (!['audit', 'provision'].includes(command)) throw new Error('Use audit, or provision --apply with JSON on stdin');
    if (!process.env.MONGODB_URI) throw new Error('Explicit operator database credentials are required');
    mongoose.set('autoCreate', false);
    mongoose.set('autoIndex', false);
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        const db = mongoose.connection.db;
        if (command === 'audit') return createAuditReport(await readInventory(db));
        const session = await mongoose.startSession();
        let result;
        try {
            await session.withTransaction(async () => {
                // Serialize this tool's provisioning attempts. Never reset existing accounts.
                await db.collection('privileged_provisioning_lock').updateOne({ _id: 'operator' },
                    { $inc: { revision: 1 } }, { upsert: true, session });
                const snapshot = await readInventory(db, session);
                const account = validateProvisioning(input, snapshot);
                for (const collection of ['users', 'admins']) {
                    if (await db.collection(collection).findOne({ $or: [{ email: account.email }, { phone: account.phone }] }, { session })) {
                        throw new Error('Identity already exists; no reset, promotion or merge is permitted');
                    }
                }
                const { default: Model } = await import('../models/' + account.store + '.js');
                const fields = { firstName: account.firstName, lastName: account.lastName,
                    email: account.email, phone: account.phone, password: account.password, status: 'active' };
                if (account.store === 'User') {
                    fields.userType = 'super_admin';
                    fields.adminProfile = { role: 'super_admin' };
                } else {
                    fields.role = 'super_admin';
                    fields.adminId = 'OP-' + randomBytes(12).toString('hex');
                }
                const user = new Model(fields);
                await user.save({ session }); // Uses the actual password-hashing model hook.
                await db.collection('privileged_provisioning_audit').insertOne({
                    operation: 'create_privileged_identity', targetStore: account.store, targetId: user._id,
                    operator: input.approval.operator, ticket: input.approval.ticket,
                    approvedAuditSha256: input.audit.sha256, review: input.approval.review, createdAt: new Date()
                }, { session }); // No credentials/contact details; no TTL index is created.
                result = { created: true, store: account.store, id: String(user._id) };
            }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
        } finally { await session.endSession(); }
        return result;
    } finally { await mongoose.disconnect(); }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    try {
        const command = process.argv[2];
        if ((command === 'audit' && process.argv.length !== 3) ||
            (command === 'provision' && (process.argv[3] !== '--apply' || process.argv.length !== 4)) ||
            !['audit', 'provision'].includes(command)) throw new Error('Explicit command/confirmation required');
        let input;
        if (command === 'provision') {
            let body = '';
            for await (const chunk of process.stdin) {
                body += chunk;
                if (Buffer.byteLength(body) > 2 * 1024 * 1024) throw new Error('Input too large');
            }
            input = JSON.parse(body);
        }
        const { default: mongoose } = await import('mongoose');
        console.log(JSON.stringify(await runOperatorCommand(command, input, mongoose), null, 2));
    } catch {
        console.error('Operator operation failed. No success is recorded; check restricted credentials, audit approval and transaction support. Never retry by changing existing identities manually.');
        process.exitCode = 1;
    }
}
