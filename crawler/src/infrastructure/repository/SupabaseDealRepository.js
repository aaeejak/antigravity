import { DealRepository } from '../../domain/deal/DealRepository.js';

export class SupabaseDealRepository extends DealRepository {
    /**
     * @param {import('@supabase/supabase-js').SupabaseClient} supabaseClient 
     */
    constructor(supabaseClient) {
        super();
        if (!supabaseClient) {
            throw new Error("Missing Supabase client for repository");
        }
        this.supabase = supabaseClient;
    }

    async saveAll(deals) {
        if (!deals || deals.length === 0) return;

        console.log(`Upserting ${deals.length} deals to Supabase...`);
        const { error } = await this.supabase.from('deals').upsert(
            deals.map(d => {
                const item = {
                    id: d.id,
                    title: d.title,
                    url: d.url,
                    source: d.source,
                    deal_id: d.deal_id,
                    price: d.price,
                    original_price: d.original_price,
                    thumbnail: d.thumbnail,
                };
                if (d.posted_at) {
                    item.created_at = d.posted_at;
                }
                return item;
            }),
            { onConflict: 'url' }
        );

        if (error) {
            throw new Error(`Supabase upsert failed: ${error.message}`);
        }
        console.log('Successfully saved to Supabase.');
    }
}
