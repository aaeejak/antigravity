import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';
import { PpomppuScraper } from '../../../src/infrastructure/scraper/PpomppuScraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('PpomppuScraper (Infrastructure)', () => {
    it('should parse valid deal items from html', async () => {
        // EUC-KR HTML is decoded by PpomppuScraper internally or by fetcher, 
        // but for parseHtml() we assume we pass the string or buffer.
        // For simplicity, we pass buffer to the scraper so it handles decoding.
        const buffer = fs.readFileSync(path.join(__dirname, '../../fixtures/ppomppu.html'));
        const scraper = new PpomppuScraper();

        const deals = scraper.parseBuffer(buffer);

        expect(deals.length).toBeGreaterThan(0);
        expect(deals[0].title).toBeDefined();
        expect(deals[0].url).toContain('ppomppu.co.kr');
        expect(deals[0].source).toBe('ppomppu');
        expect(deals[0].price).toBeDefined();
        expect(deals[0].posted_at).not.toBeNull();
        // Since the fixture might have a specific date (e.g. "26.02.22 19:28:41"), 
        // we check that posted_at is a valid ISO string.
        const time = new Date(deals[0].posted_at).getTime();
        expect(time).not.toBeNaN();
        expect(time).toBeGreaterThan(0);
    });
});
