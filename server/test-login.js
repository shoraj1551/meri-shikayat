import axios from 'axios';

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/admin/auth/login', {
            identifier: 'admin@example.com',
            password: 'Admin@123'
        });
        console.log('Login Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Login Error:', error);
    }
};

testLogin();
