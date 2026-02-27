import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function main() {
    const { data, error } = await supabase
        .from('deals')
        .select('title, source, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error(error);
        return;
    }

    const now = new Date();
    data.forEach(d => {
        const dealDate = new Date(d.created_at);
        const diffInMinutes = Math.floor((now - dealDate) / (1000 * 60));
        console.log(`[${d.source}] ${d.title}`);
        console.log(`  created_at: ${d.created_at} (${diffInMinutes} mins ago)`);
    });
}
main();
