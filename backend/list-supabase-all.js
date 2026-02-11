const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listBuckets() {
    const { data: buckets, error: bError } = await supabase.storage.listBuckets();
    if (bError) {
        console.error('Error listing buckets:', bError);
        return;
    }

    console.log('Buckets:', buckets.map(b => b.name));

    for (const bucket of buckets) {
        console.log(`\nFiles in bucket "${bucket.name}":`);
        const { data: files, error: fError } = await supabase.storage.from(bucket.name).list();
        if (fError) {
            console.error(`Error listing files in ${bucket.name}:`, fError);
            continue;
        }
        if (files.length === 0) console.log('  (empty)');
        files.forEach(file => console.log(`  - ${file.name}`));
    }
}

listBuckets();
