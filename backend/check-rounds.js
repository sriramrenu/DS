const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const rounds = await prisma.roundContent.findMany();
    console.log(JSON.stringify(rounds, null, 2));

    const settings = await prisma.systemSetting.findMany();
    console.log('Settings:', JSON.stringify(settings, null, 2));
}

check().then(() => prisma.$disconnect());
