import { Request, Response } from 'express';
import { PrismaClient, Group, Role } from '@prisma/client';

const prisma = new PrismaClient();

export const seedDatabase = async (req: Request, res: Response) => {
    try {
        // 1. Cleanup
        await prisma.submission.deleteMany();
        await prisma.score.deleteMany();
        await prisma.user.deleteMany();
        await prisma.team.deleteMany();

        // 2. Create Admin
        await prisma.user.create({
            data: { username: 'admin', password: 'password123', role: Role.Admin },
        });

        // 3. Create Teams
        for (let i = 1; i <= 25; i++) {
            let group: Group = Group.L1;
            if (i >= 7 && i <= 12) group = Group.L2;
            if (i >= 13 && i <= 18) group = Group.S1;
            if (i >= 19) group = Group.S2;

            const teamName = `DataTeam ${i}`;
            const username = `user${i}`;

            const team = await prisma.team.create({
                data: { team_name: teamName, group: group },
            });

            await prisma.user.create({
                data: { username, password: 'password123', role: Role.Participant, teamId: team.id },
            });

            await prisma.score.create({ data: { teamId: team.id } });
        }

        res.json({ message: 'Database seeded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Seed failed', details: error });
    }
};
