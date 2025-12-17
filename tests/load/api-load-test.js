/**
 * Load Testing Script
 * TASK-PR-024: k6 load testing for 1000 req/s
 * 
 * Run: k6 run tests/load/api-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
    stages: [
        // Ramp up
        { duration: '2m', target: 100 },   // Ramp to 100 users
        { duration: '3m', target: 500 },   // Ramp to 500 users
        { duration: '2m', target: 1000 },  // Ramp to 1000 users

        // Sustained load
        { duration: '5m', target: 1000 },  // Stay at 1000 users

        // Ramp down
        { duration: '2m', target: 0 },     // Ramp down to 0
    ],

    thresholds: {
        'http_req_duration': ['p(95)<500', 'p(99)<2000'], // 95% < 500ms, 99% < 2s
        'http_req_failed': ['rate<0.01'],                  // Error rate < 1%
        'errors': ['rate<0.01'],
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000';

// Test scenarios
export default function () {
    // Health check
    testHealthCheck();
    sleep(1);

    // Authentication flow
    testAuthFlow();
    sleep(1);

    // Complaint listing
    testComplaintListing();
    sleep(1);
}

function testHealthCheck() {
    const res = http.get(`${BASE_URL}/api/v1/health`);

    const success = check(res, {
        'health check status is 200': (r) => r.status === 200,
        'health check response time < 200ms': (r) => r.timings.duration < 200,
    });

    errorRate.add(!success);
    responseTime.add(res.timings.duration);
}

function testAuthFlow() {
    const loginPayload = JSON.stringify({
        identifier: 'test@example.com',
        password: 'Test@1234'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, params);

    const success = check(res, {
        'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
        'login response time < 1s': (r) => r.timings.duration < 1000,
    });

    errorRate.add(!success);
    responseTime.add(res.timings.duration);
}

function testComplaintListing() {
    const res = http.get(`${BASE_URL}/api/v1/complaints?page=1&limit=20`);

    const success = check(res, {
        'complaints status is 200': (r) => r.status === 200,
        'complaints response time < 500ms': (r) => r.timings.duration < 500,
        'complaints has data': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.data !== undefined;
            } catch {
                return false;
            }
        },
    });

    errorRate.add(!success);
    responseTime.add(res.timings.duration);
}

// Teardown
export function teardown(data) {
    console.log('Load test complete');
}
