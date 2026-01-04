/**
 * Circuit Breaker Tests
 * Tests for circuit breaker pattern implementation
 */

import { CircuitBreaker, STATES } from '../../../src/utils/circuitBreaker.js';

describe('Circuit Breaker', () => {
    let circuitBreaker;

    beforeEach(() => {
        circuitBreaker = new CircuitBreaker({
            name: 'test-service',
            failureThreshold: 3,
            successThreshold: 2,
            timeout: 1000,
            resetTimeout: 5000
        });
    });

    describe('CLOSED state', () => {
        it('should execute function successfully', async () => {
            const fn = jest.fn().mockResolvedValue('success');
            const result = await circuitBreaker.execute(fn);

            expect(result).toBe('success');
            expect(fn).toHaveBeenCalled();
            expect(circuitBreaker.getState().state).toBe(STATES.CLOSED);
        });

        it('should track failures', async () => {
            const fn = jest.fn().mockRejectedValue(new Error('failure'));

            await expect(circuitBreaker.execute(fn)).rejects.toThrow('failure');
            expect(circuitBreaker.getState().failureCount).toBe(1);
        });
    });

    describe('OPEN state', () => {
        beforeEach(async () => {
            // Trigger circuit breaker to open
            const fn = jest.fn().mockRejectedValue(new Error('failure'));
            for (let i = 0; i < 3; i++) {
                try {
                    await circuitBreaker.execute(fn);
                } catch (e) { }
            }
        });

        it('should reject requests immediately', async () => {
            const fn = jest.fn().mockResolvedValue('success');

            await expect(circuitBreaker.execute(fn)).rejects.toThrow('Circuit breaker test-service is OPEN');
            expect(fn).not.toHaveBeenCalled();
            expect(circuitBreaker.getState().state).toBe(STATES.OPEN);
        });

        it('should use fallback when provided', async () => {
            const fn = jest.fn().mockResolvedValue('success');
            const fallback = jest.fn().mockResolvedValue('fallback-result');

            const result = await circuitBreaker.execute(fn, fallback);

            expect(result).toBe('fallback-result');
            expect(fallback).toHaveBeenCalled();
        });

        it('should transition to HALF_OPEN after reset timeout', async () => {
            jest.useFakeTimers();
            jest.advanceTimersByTime(6000); // Advance past reset timeout

            const fn = jest.fn().mockResolvedValue('success');
            await circuitBreaker.execute(fn);

            expect(circuitBreaker.getState().state).toBe(STATES.HALF_OPEN);
            jest.useRealTimers();
        });
    });

    describe('HALF_OPEN state', () => {
        beforeEach(async () => {
            // Open circuit breaker
            const fn = jest.fn().mockRejectedValue(new Error('failure'));
            for (let i = 0; i < 3; i++) {
                try {
                    await circuitBreaker.execute(fn);
                } catch (e) { }
            }

            // Wait for reset timeout
            jest.useFakeTimers();
            jest.advanceTimersByTime(6000);
            jest.useRealTimers();
        });

        it('should close after successful requests', async () => {
            const fn = jest.fn().mockResolvedValue('success');

            await circuitBreaker.execute(fn);
            await circuitBreaker.execute(fn);

            expect(circuitBreaker.getState().state).toBe(STATES.CLOSED);
        });

        it('should reopen on failure', async () => {
            const fn = jest.fn().mockRejectedValue(new Error('failure'));

            try {
                await circuitBreaker.execute(fn);
            } catch (e) { }

            expect(circuitBreaker.getState().state).toBe(STATES.OPEN);
        });
    });

    describe('timeout', () => {
        it('should timeout long-running requests', async () => {
            const fn = jest.fn().mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve('success'), 2000))
            );

            await expect(circuitBreaker.execute(fn)).rejects.toThrow('Request timeout');
        });
    });

    describe('reset', () => {
        it('should reset circuit breaker state', async () => {
            const fn = jest.fn().mockRejectedValue(new Error('failure'));
            try {
                await circuitBreaker.execute(fn);
            } catch (e) { }

            circuitBreaker.reset();

            expect(circuitBreaker.getState().state).toBe(STATES.CLOSED);
            expect(circuitBreaker.getState().failureCount).toBe(0);
        });
    });
});
