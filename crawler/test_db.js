import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

async function check() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data, error } = await supabase.from('deals').select('source, title, price, url').order('created_at', { ascending: false }).limit(20);
    if (error) {
        console.error(error);
        return;
    }
    console.log(`Found ${data.length} latest deals:`);
    const counts = { ppomppu: 0, fmkorea: 0, quasarzone: 0 };
    for (const d of data) {
        counts[d.source] = (counts[d.source] || 0) + 1;
        console.log(`- [${d.source}] ${d.title} (${d.price})`);
    }
    console.log('Source Distribution (latest 20):', counts);
}
check();
