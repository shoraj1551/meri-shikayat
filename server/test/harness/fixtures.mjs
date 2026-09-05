import request from 'supertest';
export const registration = (overrides = {}) => ({
    firstName: 'Test', lastName: 'Citizen',
    email: 'citizen@example.com', phone: '9876543210', password: 'Citizen@1234', ...overrides
});
export const complaintData = (overrides = {}) => ({
    type: 'text', title: 'Road needs repair', description: 'A large pothole needs repair.',
    location: { address: 'Test Road', coordinates: { lat: 19.076, lng: 72.8777 } }, ...overrides
});
export const api = (context, method, path) => request(context.app)[method]('/api/v1' + path).set('X-Forwarded-For', context.ip);
