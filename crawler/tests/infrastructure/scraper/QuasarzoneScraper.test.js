import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';
import { QuasarzoneScraper } from '../../../src/infrastructure/scraper/QuasarzoneScraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('QuasarzoneScraper (Infrastructure)', () => {
    it('should parse valid deal items from html', async () => {
        const html = fs.readFileSync(path.join(__dirname, '../../fixtures/quasarzone.html'), 'utf8');
        const scraper = new QuasarzoneScraper();

        const deals = scraper.parseHtml(html);

        expect(deals.length).toBeGreaterThan(0);
        expect(deals[0].title).toBeDefined();
        expect(deals[0].url).toContain('quasarzone.com');
        expect(deals[0].source).toBe('quasarzone');
        expect(deals[0].price).toBeDefined();

        expect(deals[0].posted_at).not.toBeNull();
        const time = new Date(deals[0].posted_at).getTime();
        expect(time).not.toBeNaN();
        expect(time).toBeGreaterThan(0);
    });
});
