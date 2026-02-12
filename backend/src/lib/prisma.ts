import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Programmatically fix the connection string for Vercel if needed
let dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.includes('Datasprint@2026') || dbUrl.includes(':5432')) {
    console.log('Detected unencoded password or wrong port in DATABASE_URL. Applying fix...');
    // 1. Encode the @ sign in the password
    dbUrl = dbUrl.replace('Datasprint@2026', 'Datasprint%402026');
    // 2. Switch from direct port 5432 to pooled port 6543
    dbUrl = dbUrl.replace(':5432', ':6543');
    // 3. Ensure pgbouncer and sslmode are present
    if (!dbUrl.includes('pgbouncer')) {
        const separator = dbUrl.includes('?') ? '&' : '?';
        dbUrl += `${separator}pgbouncer=true&sslmode=require`;
    }
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: dbUrl,
            },
        },
        log: ['query', 'error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
