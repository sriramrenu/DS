import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Programmatically fix the connection string for Vercel if needed
let dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.includes('Datasprint@2026') || dbUrl.includes(':5432')) {
    console.log('Prisma: Detected formatting issues in DATABASE_URL. Applying recovery...');
    dbUrl = dbUrl.replace('Datasprint@2026', 'Datasprint%402026');
    dbUrl = dbUrl.replace(':5432', ':6543');
    if (!dbUrl.includes('pgbouncer')) {
        const separator = dbUrl.includes('?') ? '&' : '?';
        dbUrl += `${separator}pgbouncer=true&sslmode=require`;
    }
}

// Log a safe version of the URL for debugging
const safeUrl = dbUrl.replace(/:[^:]+@/, ':****@');
console.log(`Prisma: Connecting with URL: ${safeUrl}`);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: dbUrl,
            },
        },
        log: ['info', 'query', 'warn', 'error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
