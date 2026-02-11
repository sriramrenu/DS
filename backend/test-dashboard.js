const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = 'supersecretkey123';
const token = jwt.sign({
    id: 'test-user-id',
    username: 'user1',
    role: 'Participant',
    teamId: 'test-team-id',
    group: 'L1'
}, JWT_SECRET);

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/dashboard',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Dashboard Data Response:');
        console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
});

req.on('error', (error) => {
    console.error('Error calling API:', error);
});

req.end();
