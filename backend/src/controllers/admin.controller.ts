import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Get all submissions
export const getSubmissions = async (req: Request, res: Response) => {
    try {
        const submissions = await prisma.submission.findMany({
            include: {
                team: {
                    include: {
                        scores: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submissions', details: error });
    }
};

// Get all scores (teams)
export const getScores = async (req: Request, res: Response) => {
    try {
        const teams = await prisma.team.findMany({
            include: {
                scores: true,
            },
            orderBy: {
                team_name: 'asc',
            },
        });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scores', details: error });
    }
};

// Update Team Score
export const updateScore = async (req: Request, res: Response) => {
    const { teamId, field, value } = req.body;

    if (!teamId || !field || value === undefined) {
        return res.status(400).json({ error: 'Missing teamId, field, or value' });
    }

    try {
        const currentScore = await prisma.score.findUnique({
            where: { teamId },
        });

        if (!currentScore) {
            await prisma.score.create({ data: { teamId } });
        }

        const data: any = {};
        const scoreVal = parseFloat(value);

        if (field === 'visualization') data.visualization_score = scoreVal;
        else if (field === 'prediction') data.prediction_score = scoreVal;
        else if (field === 'feature') data.feature_score = scoreVal;
        else if (field === 'code') data.code_score = scoreVal;
        else if (field === 'judges') data.judges_score = scoreVal;
        else return res.status(400).json({ error: 'Invalid field' });

        // Calculate total
        // We need current values for others
        const viz = field === 'visualization' ? scoreVal : (currentScore?.visualization_score || 0);
        const pred = field === 'prediction' ? scoreVal : (currentScore?.prediction_score || 0);
        const feat = field === 'feature' ? scoreVal : (currentScore?.feature_score || 0);
        const code = field === 'code' ? scoreVal : (currentScore?.code_score || 0);
        const judge = field === 'judges' ? scoreVal : (currentScore?.judges_score || 0);

        data.total_score = viz + pred + feat + code + judge;

        const updated = await prisma.score.upsert({
            where: { teamId },
            update: data,
            create: {
                teamId,
                ...data
            },
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update score', details: error });
    }
};

// Update multiple team scores at once
export const updateBatchScores = async (req: Request, res: Response) => {
    const { updates } = req.body; // Array of { teamId, viz, pred, feat, code, judge } OR { teamId, round1, round2, round3, round4 }

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ error: 'Missing or invalid updates array' });
    }

    try {
        const results = await Promise.all(updates.map(async (u: any) => {
            const { teamId, viz, pred, feat, code, judge, round1, round2, round3, round4 } = u;

            // Support both criteria-based and round-based scoring
            const updateData: any = {};
            let total = 0;

            // If round-based scores are provided
            if (round1 !== undefined || round2 !== undefined || round3 !== undefined || round4 !== undefined) {
                updateData.round1_score = round1 || 0;
                updateData.round2_score = round2 || 0;
                updateData.round3_score = round3 || 0;
                updateData.round4_score = round4 || 0;
                total = (round1 || 0) + (round2 || 0) + (round3 || 0) + (round4 || 0);
            }
            // Otherwise use criteria-based scores (legacy)
            else {
                updateData.visualization_score = viz || 0;
                updateData.prediction_score = pred || 0;
                updateData.feature_score = feat || 0;
                updateData.code_score = code || 0;
                updateData.judges_score = judge || 0;
                total = (viz || 0) + (pred || 0) + (feat || 0) + (code || 0) + (judge || 0);
            }

            updateData.total_score = total;

            return prisma.score.upsert({
                where: { teamId },
                update: updateData,
                create: {
                    teamId,
                    ...updateData
                }
            });
        }));

        res.json({ success: true, count: results.length });
    } catch (error) {
        console.error('Batch update failed:', error);
        res.status(500).json({ error: 'Failed to update batch scores', details: error });
    }
};

// Get all members (participants)
export const getMembers = async (req: Request, res: Response) => {
    try {
        console.log('Fetching members...');
        const members = await prisma.user.findMany({
            where: { role: 'Participant' },
            select: {
                id: true,
                username: true,
                role: true,
                team: {
                    select: {
                        id: true,
                        team_name: true,
                        group: true
                    }
                }
            },
            orderBy: {
                username: 'asc'
            }
        });
        console.log(`Found ${members.length} members.`);
        res.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Failed to fetch members', details: error });
    }
};
// Get Current Round
export const getSystemSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

// Initiate Round
export const initiateRound = async (req: Request, res: Response) => {
    const { round } = req.body;
    if (!round) return res.status(400).json({ error: 'Missing round number' });

    try {
        const updated = await prisma.systemSetting.upsert({
            where: { key: 'current_round' },
            update: { value: round.toString() },
            create: { key: 'current_round', value: round.toString() },
        });

        res.json({ message: `Round ${round} initiated successfully`, setting: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initiate round', details: error });
    }
};

export const setRoundTimer = async (req: Request, res: Response) => {
    const { durationHours } = req.body; // Duration in hours
    if (durationHours === undefined) return res.status(400).json({ error: 'Missing duration' });

    try {
        const endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

        const updated = await prisma.systemSetting.upsert({
            where: { key: 'round_end_time' },
            update: { value: endTime },
            create: { key: 'round_end_time', value: endTime },
        });

        res.json({ message: 'Timer set successfully', endTime: updated.value });
    } catch (error) {
        res.status(500).json({ error: 'Failed to set timer', details: error });
    }
};

export const stopRoundTimer = async (req: Request, res: Response) => {
    try {
        await prisma.systemSetting.delete({
            where: { key: 'round_end_time' },
        });

        res.json({ message: 'Timer stopped successfully' });
    } catch (error) {
        // If it doesn't exist, we can just say it's stopped/cleared
        res.json({ message: 'Timer cleared or already stopped' });
    }
};
