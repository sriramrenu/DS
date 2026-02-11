const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' }); // Adjusted path if running inside backend dir

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listFiles() {
    const { data, error } = await supabase
        .storage
        .from('datasets')
        .list();

    if (error) {
        console.error('Error listing files:', error);
        return;
    }

    console.log('Files in datasets bucket:');
    if (data.length === 0) console.log('No files found.');
    data.forEach(file => console.log(`- ${file.name}`));
}

listFiles();
