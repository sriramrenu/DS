const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateRounds() {
    try {
        console.log('🔄 Populating submissions for rounds 1-4...');

        const teams = await prisma.team.findMany();
        if (teams.length === 0) {
            console.log('❌ No teams found. Seed the database first.');
            return;
        }

        const submissions = [];

        for (const team of teams) {
            for (let round = 1; round <= 4; round++) {
                // Check if already exists to avoid duplicates
                const existing = await prisma.submission.findFirst({
                    where: { teamId: team.id, round: round }
                });

                if (!existing) {
                    submissions.push({
                        teamId: team.id,
                        round: round,
                        imageUrl: `https://picsum.photos/seed/${team.id}_round${round}/800/600`, // Random placeholder
                        numericAnswer: Math.round(Math.random() * 1000) / 10,
                        submittedAt: new Date(Date.now() - (5 - round) * 24 * 60 * 60 * 1000) // Staggered days
                    });
                }
            }
        }

        if (submissions.length > 0) {
            await prisma.submission.createMany({
                data: submissions
            });
            console.log(`✅ Successfully added ${submissions.length} submissions across rounds 1-4.`);
        } else {
            console.log('ℹ️ All rounds already have submissions for all teams.');
        }

    } catch (error) {
        console.error('❌ Error populating rounds:', error);
    } finally {
        await prisma.$disconnect();
    }
}

populateRounds();
