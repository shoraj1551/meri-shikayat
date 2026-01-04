/**
 * Circuit Breaker Pattern Implementation
 * TASK-018: Add circuit breakers for external service calls
 * Prevents cascading failures and improves resilience
 */

import logger from '../utils/logger.js';

/**
 * Circuit breaker states
 */
const STATES = {
    CLOSED: 'CLOSED',       // Normal operation
    OPEN: 'OPEN',           // Failing, reject requests
    HALF_OPEN: 'HALF_OPEN'  // Testing if service recovered
};

/**
 * Circuit Breaker class
 */
class CircuitBreaker {
    constructor(options = {}) {
        this.name = options.name || 'default';
        this.failureThreshold = options.failureThreshold || 5;
        this.successThreshold = options.successThreshold || 2;
        this.timeout = options.timeout || 60000; // 1 minute
        this.resetTimeout = options.resetTimeout || 30000; // 30 seconds

        this.state = STATES.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
    }

    async execute(fn, fallback = null) {
        if (this.state === STATES.OPEN) {
            if (Date.now() < this.nextAttempt) {
                logger.warn('Circuit breaker OPEN - rejecting request', {
                    name: this.name,
                    nextAttempt: new Date(this.nextAttempt)
                });

                if (fallback) {
                    return await fallback();
                }
                throw new Error(`Circuit breaker ${this.name} is OPEN`);
            }

            // Try to recover
            this.state = STATES.HALF_OPEN;
            logger.info('Circuit breaker entering HALF_OPEN state', { name: this.name });
        }

        try {
            const result = await this.executeWithTimeout(fn);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();

            if (fallback) {
                logger.info('Circuit breaker using fallback', { name: this.name });
                return await fallback();
            }

            throw error;
        }
    }

    async executeWithTimeout(fn) {
        return Promise.race([
            fn(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), this.timeout)
            )
        ]);
    }

    onSuccess() {
        this.failureCount = 0;

        if (this.state === STATES.HALF_OPEN) {
            this.successCount++;

            if (this.successCount >= this.successThreshold) {
                this.state = STATES.CLOSED;
                this.successCount = 0;
                logger.info('Circuit breaker CLOSED - service recovered', { name: this.name });
            }
        }
    }

    onFailure() {
        this.failureCount++;

        if (this.failureCount >= this.failureThreshold) {
            this.state = STATES.OPEN;
            this.nextAttempt = Date.now() + this.resetTimeout;

            logger.error('Circuit breaker OPEN - too many failures', {
                name: this.name,
                failureCount: this.failureCount,
                nextAttempt: new Date(this.nextAttempt)
            });
        }
    }

    getState() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            nextAttempt: this.state === STATES.OPEN ? new Date(this.nextAttempt) : null
        };
    }

    reset() {
        this.state = STATES.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        logger.info('Circuit breaker manually reset', { name: this.name });
    }
}

// Pre-configured circuit breakers for common services
export const circuitBreakers = {
    sms: new CircuitBreaker({ name: 'SMS_SERVICE', failureThreshold: 3, timeout: 5000 }),
    email: new CircuitBreaker({ name: 'EMAIL_SERVICE', failureThreshold: 3, timeout: 10000 }),
    ml: new CircuitBreaker({ name: 'ML_SERVICE', failureThreshold: 5, timeout: 15000 }),
    redis: new CircuitBreaker({ name: 'REDIS', failureThreshold: 3, timeout: 2000 })
};

/**
 * Get all circuit breaker states
 */
export const getAllStates = () => {
    return Object.values(circuitBreakers).map(cb => cb.getState());
};

export { CircuitBreaker, STATES };

export default {
    CircuitBreaker,
    circuitBreakers,
    getAllStates,
    STATES
};
