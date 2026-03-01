import dotenv from 'dotenv';
import { FmkoreaScraper } from '../../infrastructure/scraper/FmkoreaScraper.js';
import { QuasarzoneScraper } from '../../infrastructure/scraper/QuasarzoneScraper.js';
import { PpomppuScraper } from '../../infrastructure/scraper/PpomppuScraper.js';
import { SupabaseDealRepository } from '../../infrastructure/repository/SupabaseDealRepository.js';
import { CrawlDealsUseCase } from '../../application/crawling/CrawlDealsUseCase.js';

dotenv.config();

async function main() {
    try {
        console.log("=== Initializing Crawler Expansion Pipeline ===");

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseClient = createClient(supabaseUrl, supabaseKey);

        const repository = new SupabaseDealRepository(supabaseClient);

        const scrapers = [
            new FmkoreaScraper(),
            new QuasarzoneScraper(),
            new PpomppuScraper()
        ];

        const useCase = new CrawlDealsUseCase(scrapers, repository);

        console.log("Executing use case...");
        await useCase.execute();

        console.log("=== Pipeline Execution Complete ===");
        process.exit(0);
    } catch (e) {
        console.error("Fatal Pipeline Error:", e);
        process.exit(1);
    }
}

main();
