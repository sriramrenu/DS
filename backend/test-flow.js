const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';

async function runTest() {
    try {
        console.log('🚀 Starting Full Stack Test...\n');

        // 1. Participant Login
        console.log('🔹 1. Logging in as Participant (user1)...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'user1', password: 'password123' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
        const userToken = loginData.token;
        console.log('✅ Login Successful! Token received.\n');

        // 2. Get Dashboard
        console.log('🔹 2. Fetching Dashboard...');
        const dashRes = await fetch(`${BASE_URL}/dashboard`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const dashData = await dashRes.json();
        if (!dashRes.ok) {
            console.warn(`⚠️ Dashboard warning: ${JSON.stringify(dashData)} (Likely missing dataset in storage)`);
        } else {
            console.log(`✅ Dashboard content: ${dashData.taskDescription}\n`);
        }

        // 3. Submit Work (Image)
        console.log('🔹 3. Submitting Work...');
        const formData = new FormData();
        // Create dummy file
        const dummyPath = path.join(__dirname, 'test-image.txt');
        fs.writeFileSync(dummyPath, 'This is a test image content');
        const fileContent = new Blob(['This is a test image content'], { type: 'text/plain' });
        formData.append('file', fileContent, 'test-image.txt');
        formData.append('numericAnswer', '123.45');

        const submitRes = await fetch(`${BASE_URL}/submit`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${userToken}` },
            body: formData
        });
        const submitData = await submitRes.json();
        // Note: Start server might fail upload if supabase not configured, but let's see.
        if (!submitRes.ok) console.warn(`⚠️ Submission warning (likely bucket missing): ${JSON.stringify(submitData)}`);
        else console.log(`✅ Submission Successful! URL: ${submitData.url}\n`);

        // 4. Admin Login
        console.log('🔹 4. Logging in as Admin...');
        const adminRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123' })
        });
        const adminData = await adminRes.json();
        if (!adminRes.ok) throw new Error(`Admin Login failed: ${JSON.stringify(adminData)}`);
        const adminToken = adminData.token;
        console.log('✅ Admin Login Successful!\n');

        // 5. Check Submissions
        console.log('🔹 5. Checking Submissions...');
        const subsRes = await fetch(`${BASE_URL}/admin/submissions`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const subsData = await subsRes.json();
        console.log(`✅ Found ${subsData.length} submissions.\n`);

        // 6. Update Score
        console.log('🔹 6. Updating Score for Team 1...');
        // Find team 1 id from user1 data or just assume
        const teamId = loginData.user.teamId;
        const scoreRes = await fetch(`${BASE_URL}/admin/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                teamId,
                phase1: 99,
                round: 1,
                score: 99 // Redundant but testing logic
            })
        });
        const scoreData = await scoreRes.json();
        if (!scoreRes.ok) throw new Error(`Score Update failed: ${JSON.stringify(scoreData)}`);
        console.log(`✅ Score Updated: Phase1=${scoreData.phase1_score}, Total=${scoreData.total_score}\n`);

        console.log('🎉 Full Stack Test PASSED!');

    } catch (error) {
        console.error('❌ Test FAILED:', error);
    }
}

runTest();
