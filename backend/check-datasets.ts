import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

async function checkDatasets() {
    console.log('\n========== CHECKING SUPABASE STORAGE STRUCTURE ==========\n');

    // Expected structure based on dashboard controller:
    // Main datasets: GROUP/roundX/roundX_GROUP_1.csv, roundX_GROUP_2.csv
    // Phase 2: Phase 2/TYPE/roundX_final_TYPE_1.csv, roundX_final_TYPE_2.csv

    const groups = ['L1', 'L2', 'S1', 'S2'];
    const rounds = [1, 2, 3, 4];

    const results: any = {
        mainDatasets: [],
        phase2Datasets: [],
        missing: []
    };

    // Check main datasets for each group and round
    for (const group of groups) {
        for (const round of rounds) {
            const prefix = `round${round}`;
            const folder = `${group}/round${round}/`;

            // List files in this folder
            const { data, error } = await supabase.storage
                .from('datasets')
                .list(folder, { limit: 100 });

            if (error) {
                results.missing.push(`${folder} - ERROR: ${error.message}`);
                continue;
            }

            if (!data || data.length === 0) {
                results.missing.push(`${folder} - EMPTY FOLDER`);
                continue;
            }

            const expectedFiles = [
                `${prefix}_${group}_1.csv`,
                `${prefix}_${group}_2.csv`
            ];

            const foundFiles = data.map(f => f.name);
            const missing = expectedFiles.filter(f => !foundFiles.includes(f));

            if (missing.length > 0) {
                results.missing.push(`${folder} - Missing: ${missing.join(', ')}`);
            } else {
                results.mainDatasets.push(`✓ ${folder}: ${foundFiles.join(', ')}`);
            }
        }
    }

    // Check Phase 2 datasets (L and S tracks)
    const trackTypes = ['L', 'S'];
    for (const trackType of trackTypes) {
        for (const round of rounds) {
            const prefix = `round${round}`;
            const folder = `Phase 2/${trackType}/`;

            // List files in Phase 2 folder
            const { data, error } = await supabase.storage
                .from('datasets')
                .list(folder, { limit: 100 });

            if (error) {
                results.missing.push(`${folder} - ERROR: ${error.message}`);
                continue;
            }

            if (!data || data.length === 0) {
                results.missing.push(`${folder} - EMPTY FOLDER`);
                continue;
            }

            const expectedFiles = [
                `${prefix}_final_${trackType}_1.csv`,
                `${prefix}_final_${trackType}_2.csv`
            ];

            const foundFiles = data.map(f => f.name);
            const roundFiles = foundFiles.filter(f => f.includes(`round${round}`));
            const missing = expectedFiles.filter(f => !foundFiles.includes(f));

            if (missing.length > 0) {
                results.missing.push(`${folder} (Round ${round}) - Missing: ${missing.join(', ')}`);
            } else {
                results.phase2Datasets.push(`✓ ${folder} (Round ${round}): ${roundFiles.join(', ')}`);
            }
        }
    }

    // Print results
    console.log('📁 Main Datasets Status:');
    console.log('------------------------');
    results.mainDatasets.forEach((msg: string) => console.log(msg));

    console.log('\n📁 Phase 2 Datasets Status:');
    console.log('---------------------------');
    results.phase2Datasets.forEach((msg: string) => console.log(msg));

    if (results.missing.length > 0) {
        console.log('\n⚠️ MISSING OR ERRORS:');
        console.log('----------------------');
        results.missing.forEach((msg: string) => console.log(`❌ ${msg}`));
    } else {
        console.log('\n✅ ALL DATASETS FOUND! All rounds have both main and phase 2 datasets.');
    }

    console.log('\n=========================================================\n');
}

checkDatasets().then(() => process.exit(0)).catch(console.error);
