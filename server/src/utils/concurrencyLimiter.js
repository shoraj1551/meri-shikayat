export class ConcurrencyLimiter {
    constructor(limit) {
        if (!Number.isInteger(limit) || limit < 1) {
            throw new TypeError('Concurrency limit must be a positive integer');
        }
        this.limit = limit;
        this.active = 0;
        this.rejected = 0;
    }

    tryAcquire() {
        if (this.active >= this.limit) {
            this.rejected += 1;
            return null;
        }

        this.active += 1;
        let released = false;
        return () => {
            if (released) return;
            released = true;
            this.active -= 1;
        };
    }

    getState() {
        return { limit: this.limit, active: this.active, rejected: this.rejected };
    }
}

export default ConcurrencyLimiter;
