const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearSubmissions() {
    try {
        console.log('🧹 Clearing all submissions from the database...');

        const deleted = await prisma.submission.deleteMany({});

        console.log(`✅ Successfully deleted ${deleted.count} submissions.`);
        console.log('✨ All submission "stack" images have been cleared.');

    } catch (error) {
        console.error('❌ Error clearing submissions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearSubmissions();
