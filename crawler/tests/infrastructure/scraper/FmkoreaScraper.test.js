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

    it('should parse valid deal items from html and fetch articleHtml for thumbnail/date', async () => {
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
                        </div>
                    </li>
                </ul>
            </div>
        `;

        // Mock detail page HTML
        const detailHtml = `
            <div class="xe_content">
                <img src="/image.jpg" />
            </div>
            <span class="date m_no">2026.02.26 15:53</span>
        `;

        global.fetch.mockResolvedValueOnce({
            ok: true,
            text: async () => detailHtml
        });

        const scraper = new FmkoreaScraper();
        const deals = await scraper.parseHtml(listHtml);

        expect(deals.length).toBe(1);
        expect(deals[0].title).toBe('Test Deal');
        expect(deals[0].url).toBe('https://fmkorea.com/hotdeal/12345');
        expect(deals[0].thumbnail).toBe('https://fmkorea.com/image.jpg');

        // newly added RED test expectations
        expect(deals[0].posted_at).not.toBeNull();
        const time = new Date(deals[0].posted_at).getTime();
        expect(time).not.toBeNaN();
        expect(time).toBeGreaterThan(0);
    });
});
