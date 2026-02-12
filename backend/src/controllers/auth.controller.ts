import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    console.log(`LOGIN ATTEMPT: User=${username}`);

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: { team: true },
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role, teamId: user.teamId, group: user.team?.group },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                teamId: user.teamId,
                group: user.team?.group,
            },
        });
    } catch (error: any) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({
            error: 'Login failed',
            code: error.code, // Prisma error code (e.g., P1001)
            message: error.message,
            details: error.meta || 'No additional details'
        });
    }
};
