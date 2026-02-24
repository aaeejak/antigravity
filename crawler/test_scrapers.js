import { FmkoreaScraper } from './src/infrastructure/scraper/FmkoreaScraper.js';
import { QuasarzoneScraper } from './src/infrastructure/scraper/QuasarzoneScraper.js';
import { PpomppuScraper } from './src/infrastructure/scraper/PpomppuScraper.js';

async function test() {
    try {
        const s1 = new FmkoreaScraper();
        const d1 = await s1.scrape();
        console.log('Fmkorea 1st deal:', d1[0]);
    } catch (e) { console.log('Fmkorea Error:', e.message); }

    try {
        const s2 = new QuasarzoneScraper();
        const d2 = await s2.scrape();
        console.log('Quasarzone 1st deal:', d2[0]);
    } catch (e) { console.log('Quasarzone Error:', e.message); }

    try {
        const s3 = new PpomppuScraper();
        const d3 = await s3.scrape();
        console.log('Ppomppu 1st deal:', d3[0]);
    } catch (e) { console.log('Ppomppu Error:', e.message); }
}

test();
