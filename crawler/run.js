import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { CrawlDealsUseCase } from './src/application/crawling/CrawlDealsUseCase.js';
import { FmkoreaScraper } from './src/infrastructure/scraper/FmkoreaScraper.js';
import { QuasarzoneScraper } from './src/infrastructure/scraper/QuasarzoneScraper.js';
import { PpomppuScraper } from './src/infrastructure/scraper/PpomppuScraper.js';
import { SupabaseDealRepository } from './src/infrastructure/repository/SupabaseDealRepository.js';

dotenv.config();

async function main() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase credentials in .env");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const repository = new SupabaseDealRepository(supabase);

    const scrapers = [
        new FmkoreaScraper(),
        new QuasarzoneScraper(),
        new PpomppuScraper()
    ];

    const useCase = new CrawlDealsUseCase(scrapers, repository);

    console.log("--- Starting Scheduled Crawling Pipeline ---");
    await useCase.execute();
    console.log("--- Pipeline Execution Complete ---");
}

main().catch(e => {
    console.error("Failed to execute pipeline:", e);
    process.exit(1);
});
