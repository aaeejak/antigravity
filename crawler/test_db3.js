import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

async function check() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data, error } = await supabase.from('deals').select('title, price, url, created_at, updated_at').ilike('title', '%AMD 라이젠%');
    console.log(data);

    const { data: qz, error: e2 } = await supabase.from('deals').select('title, price, created_at, updated_at').eq('source', 'quasarzone').order('updated_at', { ascending: false }).limit(5);
    console.log('\nQuasarzone latest updated_at:');
    console.log(qz);
}
check();
