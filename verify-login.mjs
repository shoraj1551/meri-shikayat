// Using native fetch

const uniqueEmail = `testuser_${Date.now()}@example.com`;

const registerUser = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                email: uniqueEmail,
                phone: `9${Date.now().toString().slice(-9)}`,
                password: 'password123',
                dateOfBirth: '2000-01-01'
            })
        });

        const data = await response.json();
        console.log('User Register Status:', response.status);
        console.log('User Register Response:', data);
        return response.ok;
    } catch (error) {
        console.error('User Register Error:', error);
        return false;
    }
};

const loginUser = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: uniqueEmail,
                password: 'password123'
            })
        });

        const data = await response.json();
        console.log('User Login Status:', response.status);
        console.log('User Login Response:', data);
    } catch (error) {
        console.error('User Login Error:', error);
    }
};

const loginAdmin = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@example.com',
                password: 'superadmin123'
            })
        });

        const data = await response.json();
        console.log('Admin Login Status:', response.status);
        console.log('Admin Login Response:', data);
    } catch (error) {
        console.error('Admin Login Error:', error);
    }
};

console.log('Starting login verification...');
await registerUser();
await loginUser();
await loginAdmin();
