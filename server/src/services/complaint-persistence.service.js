import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import Media from '../models/Media.js';
import {
    createComplaintWithUniqueId,
    isComplaintIdDuplicate
} from './complaintId.service.js';

const MAX_TRANSACTION_ATTEMPTS = 5;

export async function persistComplaintSubmission({
    complaintData,
    mediaData,
    userId,
    userModel
}, {
    startSession = () => mongoose.startSession(),
    complaintModel = Complaint,
    mediaModel = Media,
    maxAttempts = MAX_TRANSACTION_ATTEMPTS
} = {}) {
    if (!userModel?.findByIdAndUpdate) throw new TypeError('A valid user model is required');
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
        throw new TypeError('maxAttempts must be a positive integer');
    }

    const session = await startSession();
    try {
        let lastCollision;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            let complaint;
            try {
                await session.withTransaction(async () => {
                    complaint = await createComplaintWithUniqueId(complaintData, {
                        complaintModel,
                        maxAttempts: 1,
                        createOptions: { session }
                    });

                    if (mediaData) {
                        const [media] = await mediaModel.create([{
                            ...mediaData,
                            complaint: complaint._id
                        }], { session });
                        complaint.media = [media._id];
                        await complaintModel.updateOne(
                            { _id: complaint._id },
                            { $set: { media: [media._id] } },
                            { session }
                        );
                    }

                    const updatedUser = await userModel.findByIdAndUpdate(userId, {
                        $inc: {
                            'stats.totalComplaints': 1,
                            'stats.impactScore': 5
                        }
                    }, { new: true, session });
                    if (!updatedUser) throw new Error('Complaint owner no longer exists');
                }, {
                    readConcern: { level: 'snapshot' },
                    writeConcern: { w: 'majority' }
                });
                return complaint;
            } catch (error) {
                if (!isComplaintIdDuplicate(error)) throw error;
                lastCollision = error;
            }
        }
        throw lastCollision;
    } finally {
        await session.endSession();
    }
}
