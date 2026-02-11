const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Cleanup
    try {
        await prisma.submission.deleteMany();
        await prisma.score.deleteMany();
        await prisma.user.deleteMany();
        await prisma.team.deleteMany();
    } catch (e) {
        console.log('Cleanup - No tables found or error:', e.message);
    }

    // 2. Create Admin
    await prisma.user.create({
        data: {
            username: 'admin',
            password: 'password123', // In production, hash this!
            role: 'Admin',
        },
    });
    console.log('Created Admin user.');

    // 3. Create Teams & Users
    const teamsData = [];

    for (let i = 1; i <= 25; i++) {
        // Determine Group
        let group = 'L1';
        if (i >= 7 && i <= 12) group = 'L2';
        if (i >= 13 && i <= 18) group = 'S1';
        if (i >= 19) group = 'S2';

        const teamName = `DataTeam ${i}`;
        const username = `user${i}`;

        // Create Team
        const team = await prisma.team.create({
            data: {
                team_name: teamName,
                group: group,
            },
        });

        // Create User for Team
        await prisma.user.create({
            data: {
                username: username,
                password: 'password123',
                role: 'Participant',
                teamId: team.id,
            },
        });

        // Create Initial Score
        await prisma.score.create({
            data: {
                teamId: team.id,
            },
        });

        teamsData.push({ team: teamName, user: username, group });
    }

    console.log(`Seeded ${teamsData.length} teams.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
