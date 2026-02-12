import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function repairDatabaseUrl(url: string): string {
    if (!url) return url;
    let repaired = url;

    // 1. Repair Password Encoding (handle @ in passwords)
    const parts = repaired.split('@');
    if (parts.length > 2) {
        const credsIndex = repaired.indexOf('://') + 3;
        const lastAt = repaired.lastIndexOf('@');
        const credentials = repaired.substring(credsIndex, lastAt);
        const [user, ...passParts] = credentials.split(':');
        const password = passParts.join(':');
        const hostPart = repaired.substring(lastAt + 1);
        repaired = `${repaired.substring(0, credsIndex)}${user}:${encodeURIComponent(password)}@${hostPart}`;
    }

    // 2. Switch from direct host (db.xxx.supabase.co) to pooler host
    // Extract the project ref from the hostname
    const directHostMatch = repaired.match(/db\.([a-z0-9]+)\.supabase\.co/);
    if (directHostMatch) {
        const projectRef = directHostMatch[1];
        // Replace direct host with pooler host
        // Note: region needs to match your Supabase project region
        // ap-south-1 is common for Indian projects
        const poolerHost = `aws-0-ap-south-1.pooler.supabase.com`;
        repaired = repaired.replace(`db.${projectRef}.supabase.co`, poolerHost);

        // Update username from 'postgres' to 'postgres.projectRef' for pooler
        repaired = repaired.replace('://postgres:', `://postgres.${projectRef}:`);
    }

    // 3. Switch to Pooled Port (5432 -> 6543)
    if (repaired.includes(':5432')) {
        repaired = repaired.replace(':5432', ':6543');
    }

    // 4. Ensure pooling parameters
    if (!repaired.includes('pgbouncer')) {
        const separator = repaired.includes('?') ? '&' : '?';
        repaired += `${separator}pgbouncer=true&connection_limit=1`;
    }

    return repaired;
}

const dbUrl = repairDatabaseUrl(process.env.DATABASE_URL || '');

// Log a safe version of the URL for debugging
const safeUrl = dbUrl.replace(/:[^:@/]+@/, ':****@');
console.log(`Prisma: Connecting with URL: ${safeUrl}`);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: dbUrl,
            },
        },
        log: ['warn', 'error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

