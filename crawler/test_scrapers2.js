import { QuasarzoneScraper } from './src/infrastructure/scraper/QuasarzoneScraper.js';
import { PpomppuScraper } from './src/infrastructure/scraper/PpomppuScraper.js';

async function test() {
    try {
        const s2 = new QuasarzoneScraper();
        const d2 = await s2.scrape();
        console.log('--- Quasarzone Deals ---');
        d2.slice(0, 5).forEach(d => console.log(`Price: [${d.price}] | Title: ${d.title}`));
    } catch (e) { console.log('Quasarzone Error:', e.message); }

    try {
        const s3 = new PpomppuScraper();
        const d3 = await s3.scrape();
        console.log('\n--- Ppomppu Deals ---');
        d3.slice(0, 5).forEach(d => console.log(`Price: [${d.price}] | Title: ${d.title}`));
    } catch (e) { console.log('Ppomppu Error:', e.message); }
}

test();
