// Test script for API endpoints
const testRegistration = async () => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstName: 'Bob',
            lastName: 'Wilson',
            dateOfBirth: '1988-04-10',
            email: 'bob.wilson@test.com',
            phone: '9123456789',
            password: 'SecurePass123!'
        })
    });
    return await response.json();
};

const testLogin = async () => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            identifier: 'bob.wilson@test.com',
            password: 'SecurePass123!'
        })
    });
    return await response.json();
};

const testInvalidLogin = async () => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            identifier: 'bob.wilson@test.com',
            password: 'WrongPassword123!'
        })
    });
    return await response.json();
};

// Run tests
console.log('Testing Registration...');
testRegistration().then(result => {
    console.log('Registration Result:', result);

    console.log('\nTesting Valid Login...');
    return testLogin();
}).then(result => {
    console.log('Login Result:', result);

    console.log('\nTesting Invalid Login...');
    return testInvalidLogin();
}).then(result => {
    console.log('Invalid Login Result:', result);
}).catch(error => {
    console.error('Error:', error);
});
