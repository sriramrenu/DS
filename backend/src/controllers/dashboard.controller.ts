import { Request, Response } from 'express';
import { Group } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabase';

export const getDashboardData = async (req: Request, res: Response) => {
    // @ts-ignore
    const { group } = req.user; // User encoded from JWT middleware

    try {
        // 1. Fetch Current Round from DB
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'current_round' }
        });
        const currentRound = setting ? parseInt(setting.value) : 1;

        // 2. Fetch Round Content (Track-specific)
        const roundContent = await prisma.roundContent.findUnique({
            where: {
                id_track: {
                    id: currentRound,
                    track: group
                }
            }
        });

        if (!roundContent) {
            return res.status(404).json({ error: 'Round content not found' });
        }

        // 3. Fetch Timer Setting
        const timerSetting = await prisma.systemSetting.findUnique({
            where: { key: 'round_end_time' }
        });

        // 4. Dataset Logic
        // Main Datasets (Track Specific): GROUP/roundX/roundX_TRACK_1.csv
        // Example: L1/round1/round1_L1_1.csv
        const dataset1Path = `${group}/round${currentRound}/${roundContent.datasetPrefix}_${group}_1.csv`;
        const dataset2Path = `${group}/round${currentRound}/${roundContent.datasetPrefix}_${group}_2.csv`;

        // Phase 2 Datasets (Shared by Track Type L or S): Phase 2/TYPE/roundX_final_TYPE_1.csv
        // Determine Track Type (L or S)
        const trackType = group.startsWith('L') ? 'L' : 'S';
        const finalDataset1Path = `Phase 2/${trackType}/${roundContent.datasetPrefix}_final_${trackType}_1.csv`;
        const finalDataset2Path = `Phase 2/${trackType}/${roundContent.datasetPrefix}_final_${trackType}_2.csv`;

        // Calculate time remaining for Phase 2 dataset release (last 45 mins)
        let finalDataset1Url = null;
        let finalDataset2Url = null;

        if (timerSetting) {
            const remaining = Math.max(0, Math.floor((new Date(timerSetting.value).getTime() - Date.now()) / 1000));
            if (remaining <= 45 * 60) { // 45 minutes
                const { data: fd1 } = await supabase.storage.from('datasets').createSignedUrl(finalDataset1Path, 3600);
                const { data: fd2 } = await supabase.storage.from('datasets').createSignedUrl(finalDataset2Path, 3600);
                finalDataset1Url = fd1?.signedUrl || null;
                finalDataset2Url = fd2?.signedUrl || null;
            }
        }

        // Generate Signed URLs for primary datasets
        const { data: d1 } = await supabase.storage.from('datasets').createSignedUrl(dataset1Path, 3600);
        const { data: d2 } = await supabase.storage.from('datasets').createSignedUrl(dataset2Path, 3600);

        res.json({
            round: currentRound,
            title: roundContent.title,
            description: roundContent.description,
            questions: roundContent.questions,
            // Return arrays of URLs
            mainDatasets: [d1?.signedUrl, d2?.signedUrl].filter(Boolean),
            finalDatasets: [finalDataset1Url, finalDataset2Url].filter(Boolean),
            // Legacy support (optional, can be removed if frontend is fully updated)
            datasetUrl: d1?.signedUrl || null,
            datasetName: dataset1Path.split('/').pop(),
            finalDatasetUrl: finalDataset1Url,
            taskDescription: `Round ${currentRound}: ${roundContent.title}`,
            endTime: timerSetting?.value || null
        });

    } catch (error) {
        console.error('Dashboard data fetch failed:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

export const submitWork = async (req: Request, res: Response) => {
    // @ts-ignore
    const { teamId, group } = req.user;
    const file = req.file; // From Multer

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1. Fetch Current Round from DB
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'current_round' } });
    const currentRound = setting ? parseInt(setting.value) : 1;

    // Upload to Supabase Storage
    const fileName = `${teamId}_round${currentRound}_${Date.now()}_${file.originalname}`;
    const { data, error } = await supabase
        .storage
        .from('submissions')
        // @ts-ignore - Multer buffer
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
        });

    if (error) {
        return res.status(500).json({ error: 'Upload failed', details: error });
    }

    // Get Public URL
    const { data: publicUrlData } = supabase
        .storage
        .from('submissions')
        .getPublicUrl(fileName);

    // Parse answers from JSON string if provided
    let submissionAnswers = {};
    if (req.body.answers) {
        try {
            submissionAnswers = typeof req.body.answers === 'string'
                ? JSON.parse(req.body.answers)
                : req.body.answers;
        } catch (e) {
            console.error('Failed to parse answers:', e);
        }
    }

    // Save to DB
    await prisma.submission.create({
        data: {
            teamId,
            round: currentRound,
            imageUrl: publicUrlData.publicUrl,
            numericAnswer: req.body.numericAnswer ? parseFloat(req.body.numericAnswer) : 0,
            answers: submissionAnswers
        },
    });

    res.json({ message: 'Submission received!', url: publicUrlData.publicUrl });
};
