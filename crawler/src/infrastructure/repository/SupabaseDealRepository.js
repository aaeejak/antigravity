import { createClient } from '@supabase/supabase-js';
import { DealRepository } from '../../domain/deal/DealRepository.js';

export class SupabaseDealRepository extends DealRepository {
    constructor(supabaseUrl, supabaseKey) {
        super();
        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase credentials for repository");
        }
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async saveAll(deals) {
        if (!deals || deals.length === 0) return;

        console.log(`Upserting ${deals.length} deals to Supabase via RPC...`);
        const { error } = await this.supabase.rpc('insert_deals', { deal_data: deals });

        if (error) {
            throw new Error(`Supabase upsert failed: ${error.message}`);
        }
        console.log('Successfully saved to Supabase.');
    }
}
