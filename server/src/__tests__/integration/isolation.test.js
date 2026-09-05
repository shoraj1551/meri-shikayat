import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

test('two parallel workers cannot see or delete each other Mongo/Redis data, and exit cleanly', { timeout: 25000 }, async t => {
    const workers = [];
    async function start(workerId) {
        const child = fork(fileURLToPath(new URL('../../../test/harness/fixtures/isolation-worker.fixture.mjs', import.meta.url)), [workerId], {
            execArgv: ['--import', fileURLToPath(new URL('../../../test/harness/environment.cjs', import.meta.url))],
            stdio: ['ignore', 'pipe', 'pipe', 'ipc']
        });
        workers.push(child);
        child.stdout.resume();
        let errors = '';
        child.stderr.on('data', chunk => { errors += chunk; });
        const ready = await Promise.race([
            once(child, 'message').then(([message]) => message),
            once(child, 'exit').then(([code]) => { throw new Error('Worker exited before readiness: ' + code + ' ' + errors); })
        ]);
        assert.equal(ready.ready, true);
        return { child, ready };
    }
    t.after(() => { for (const child of workers) if (child.exitCode === null) child.kill(); });
    const [first, second] = await Promise.all([start('1'), start('2')]);
    assert.notEqual(first.ready.database, second.ready.database);
    assert.notEqual(first.ready.prefix, second.ready.prefix);
    let sequence = 0;
    async function command(worker, command) {
        const id = ++sequence;
        const pending = once(worker.child, 'message');
        worker.child.send({ id, command });
        const [message] = await pending;
        assert.equal(message.id, id);
        assert.equal(message.error, undefined);
        return message;
    }
    const [a, b] = await Promise.all([command(first, 'read'), command(second, 'read')]);
    assert.deepEqual([a.mongo, a.redis, b.mongo, b.redis], ['1', '1', '2', '2']);
    const cleared = await command(first, 'clear');
    assert.deepEqual([cleared.mongo, cleared.redis], [null, null]);
    const untouched = await command(second, 'read');
    assert.deepEqual([untouched.mongo, untouched.redis], ['2', '2']);
    for (const worker of [first, second]) {
        const exited = once(worker.child, 'exit');
        await command(worker, 'close');
        assert.deepEqual(await exited, [0, null]);
    }
});
