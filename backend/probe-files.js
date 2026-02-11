const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const group = 'L1';
const prefix = 'round1';

const variations = [
    `${prefix}_${group}.csv`,
    `${prefix}_${group}.zip`,
    `${prefix}_final_${group}.csv`,
    `${prefix}_final_${group}.zip`,
    `${prefix}_${group.toLowerCase()}.csv`,
    `${prefix}_l1.csv`,
    `${prefix}_finaL1.csv`,
    `dataset_${prefix}_${group}.csv`
];

async function check() {
    for (const name of variations) {
        const { data, error } = await supabase.storage.from('datasets').createSignedUrl(name, 60);
        if (data && data.signedUrl) {
            console.log(`[FOUND] ${name} -> ${data.signedUrl}`);
        } else {
            console.log(`[NOT FOUND] ${name}`);
        }
    }
}

check();
