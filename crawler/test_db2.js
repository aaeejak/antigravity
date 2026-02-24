import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

async function check() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data, error } = await supabase.from('deals').select('*').in('source', ['quasarzone', 'ppomppu']).order('created_at', { ascending: false }).limit(20);
    if (error) {
        console.error(error);
        return;
    }
    console.log(`Found ${data.length} QZ/PP deals in DB:`);
    for (const d of data) {
        console.log(`- [${d.source}] ${d.title.substring(0, 30)}... (Price: ${d.price})`);
    }
}
check();
