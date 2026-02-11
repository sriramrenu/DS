import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CONFIG } from '../config';

const prisma = new PrismaClient();

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Get counts
        const totalTeams = await prisma.team.count();
        const totalParticipants = await prisma.user.count({
            where: { role: 'Participant' }
        });
        const totalSubmissions = await prisma.submission.count();

        // Get recent submissions
        const recentSubmissions = await prisma.submission.findMany({
            take: 5,
            orderBy: { submittedAt: 'desc' },
            include: {
                team: true
            }
        });

        // Get Remaining Teams to Submit for the Current Round
        const allTeams = await prisma.team.findMany();
        const roundSubmissions = await prisma.submission.findMany({
            where: { round: CONFIG.CURRENT_ROUND },
            select: { teamId: true }
        });

        const submittedTeamIds = new Set(roundSubmissions.map(s => s.teamId));
        const remainingTeams = allTeams.filter(team => !submittedTeamIds.has(team.id));

        // Get Top Ranked Teams (Top 5)
        const topTeams = await prisma.team.findMany({
            include: {
                scores: true
            },
            take: 5
        });

        // Filter and sort manually since total_score is in a relation
        const topRankedTeams = topTeams
            .filter(t => t.scores !== null)
            .sort((a, b) => (b.scores?.total_score || 0) - (a.scores?.total_score || 0));

        res.json({
            totalTeams,
            totalParticipants,
            totalSubmissions,
            totalPhases: CONFIG.TOTAL_PHASES,
            recentSubmissions,
            remainingTeams,
            topRankedTeams, // Add this
            currentRound: CONFIG.CURRENT_ROUND
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error });
    }
};
