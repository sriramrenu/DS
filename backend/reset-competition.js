const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetCompetition() {
    try {
        console.log('🔄 Resetting competition state...');

        // 1. Reset Round to 1
        await prisma.systemSetting.upsert({
            where: { key: 'current_round' },
            update: { value: '1' },
            create: { key: 'current_round', value: '1' },
        });
        console.log('✅ Round reset to 1');

        // 2. Set Timer to 3 hours from now
        const endTime = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
        await prisma.systemSetting.upsert({
            where: { key: 'round_end_time' },
            update: { value: endTime },
            create: { key: 'round_end_time', value: endTime },
        });
        console.log(`✅ Timer set to end at: ${endTime}`);

        console.log('✨ Competition "background" successfully restarted.');

    } catch (error) {
        console.error('❌ Error resetting competition:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetCompetition();
