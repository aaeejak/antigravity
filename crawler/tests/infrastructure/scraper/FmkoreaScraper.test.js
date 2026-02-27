import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FmkoreaScraper } from '../../../src/infrastructure/scraper/FmkoreaScraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('FmkoreaScraper (Infrastructure)', () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
        global.fetch = vi.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('should parse valid deal items from html and extract thumbnail/date from list html', async () => {
        // Mock list page HTML
        const listHtml = `
            <div class="fm_best_widget">
                <ul>
                    <li>
                        <div class="li">
                            <h3 class="title"><a href="/hotdeal/12345">Test Deal</a></h3>
                            <div class="hotdeal_info">
                                <span>15,000원</span>
                            </div>
                            <img src="/thumb.jpg" />
                            <span class="regdate">15:53</span>
                        </div>
                    </li>
                </ul>
            </div>
        `;

        // Mock detail page HTML (no longer used, but kept to avoid unused variable error if any)

        global.fetch.mockResolvedValueOnce({
            ok: true,
            text: async () => '' // no longer fetching detail
        });

        const scraper = new FmkoreaScraper();
        const deals = await scraper.parseHtml(listHtml);

        expect(deals.length).toBe(1);
        expect(deals[0].title).toBe('Test Deal');
        expect(deals[0].url).toBe('https://fmkorea.com/hotdeal/12345');
        expect(deals[0].thumbnail).toBe('https://fmkorea.com/thumb.jpg');

        // newly added RED test expectations
        expect(deals[0].posted_at).not.toBeNull();
        const time = new Date(deals[0].posted_at).getTime();
        expect(time).not.toBeNaN();
        expect(time).toBeGreaterThan(0);
    });
});
