import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function main() {
    const now = new Date();
    console.log("Current time (ISO):", now.toISOString());
    console.log("Current time (Local):", now.toString());

    for (const source of ['ppomppu', 'fmkorea']) {
        console.log(`\n--- ${source.toUpperCase()} ---`);
        const { data, error } = await supabase
            .from('deals')
            .select('title, created_at')
            .eq('source', source)
            .not('created_at', 'is', null)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error(error);
            continue;
        }

        data.forEach(d => {
            const dealDate = new Date(d.created_at);
            const diffMin = Math.round((now - dealDate) / (1000 * 60));
            console.log(`Title: ${d.title}`);
            console.log(`  created_at: ${d.created_at}`);
            console.log(`  diff from now: ${diffMin} minutes`);
        });
    }
}
main();
