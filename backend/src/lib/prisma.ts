import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function repairDatabaseUrl(url: string): string {
    if (!url) return url;
    let repaired = url;

    // 1. Repair Password Encoding (handle @ in passwords)
    // If there are multiple @ signs, the first ones are in the password
    const parts = repaired.split('@');
    if (parts.length > 2) {
        // e.g., postgresql://user:pass@word@host:port/db
        const credsIndex = repaired.indexOf('://') + 3;
        const lastAt = repaired.lastIndexOf('@');
        const credentials = repaired.substring(credsIndex, lastAt);
        const [user, ...passParts] = credentials.split(':');
        const password = passParts.join(':');
        const hostPart = repaired.substring(lastAt + 1);

        repaired = `${repaired.substring(0, credsIndex)}${user}:${encodeURIComponent(password)}@${hostPart}`;
    }

    // 2. Switch to Pooled Port for Vercel (5432 -> 6543)
    if (repaired.includes(':5432')) {
        repaired = repaired.replace(':5432', ':6543');
    }

    // 3. Ensure pooling parameters
    if (!repaired.includes('pgbouncer')) {
        const separator = repaired.includes('?') ? '&' : '?';
        repaired += `${separator}pgbouncer=true&sslmode=require`;
    }

    return repaired;
}

const dbUrl = repairDatabaseUrl(process.env.DATABASE_URL || '');

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
