const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const timerSetting = await prisma.systemSetting.findUnique({
        where: { key: 'round_end_time' }
    });

    if (!timerSetting) {
        console.log('No timer setting found.');
        return;
    }

    const now = Date.now();
    const end = new Date(timerSetting.value).getTime();
    const remaining = (end - now) / 1000;

    console.log('Server Current Time (UTC):', new Date(now).toISOString());
    console.log('Round End Time (UTC):', new Date(end).toISOString());
    console.log('Remaining Seconds:', remaining);
    console.log('Remaining Minutes:', remaining / 60);
    console.log('Is within 45 mins?', remaining <= 45 * 60);
}

check().then(() => prisma.$disconnect());
