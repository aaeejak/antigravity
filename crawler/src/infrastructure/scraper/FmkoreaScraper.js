import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { gotScraping } from 'got-scraping';
import { chromium } from 'playwright-chromium';
import { Deal } from '../../domain/deal/Deal.js';
import { Scraper } from '../../domain/deal/Scraper.js';
import { PriceFormatter } from '../../domain/deal/PriceFormatter.js';
import { execSync } from 'child_process';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export class FmkoreaScraper extends Scraper {
    async scrape() {
        const url = "https://www.fmkorea.com/hotdeal";

        let html = '';

        // --- Tier 1: got-scraping (fast, spoofs TLS fingerprint) ---
        try {
            console.log('[FMKorea] Tier 1: Trying got-scraping...');
            const response = await gotScraping({
                url,
                headerGeneratorOptions: {
                    browsers: [{ name: 'chrome', minVersion: 120 }],
                    devices: ['desktop'],
                    locales: ['ko-KR'],
                    operatingSystems: ['windows'],
                },
                timeout: { request: 15000 },
                ...(process.env.PROXY_URL ? { proxyUrl: process.env.PROXY_URL } : {}),
            });

            if (response.statusCode !== 200) {
                throw new Error(`got-scraping returned ${response.statusCode}`);
            }
            html = response.body;

            // Check if we got an actual page or a Cloudflare challenge
            if (this._isBlocked(html)) {
                throw new Error('got-scraping received Cloudflare challenge page');
            }
            console.log(`[FMKorea] got-scraping success (${html.length} bytes)`);
        } catch (error) {
            console.warn(`[FMKorea] Tier 1 failed: ${error.message}`);
            html = '';

            // --- Tier 2: Playwright headless browser (solves JS challenges) ---
            try {
                console.log('[FMKorea] Tier 2: Trying Playwright headless browser...');
                html = await this._fetchWithPlaywright(url);
                console.log(`[FMKorea] Playwright success (${html.length} bytes)`);
            } catch (pwError) {
                console.warn(`[FMKorea] Tier 2 failed: ${pwError.message}`);
                html = '';

                // --- Tier 3: curl fallback ---
                try {
                    console.log('[FMKorea] Tier 3: Trying curl...');
                    const isWin = process.platform === "win32";
                    const curlCmd = isWin ? 'curl.exe' : 'curl';
                    const stdout = execSync(
                        `${curlCmd} -s --max-time 15 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" -H "Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7" "${url}"`,
                        { maxBuffer: 10 * 1024 * 1024, encoding: 'latin1' }
                    );
                    const buffer = Buffer.from(stdout, 'latin1');
                    html = buffer.toString('utf8');
                    console.log(`[FMKorea] curl got ${html.length} bytes`);
                } catch (curlError) {
                    throw new Error(`Failed to fetch Fmkorea: All 3 tiers failed. Last: ${curlError.message}`);
                }
            }
        }

        if (!html || html.length < 1000) {
            throw new Error(`Failed to fetch Fmkorea: HTML too short (${html.length} bytes), possibly blocked.`);
        }

        if (this._isBlocked(html)) {
            throw new Error(`Failed to fetch Fmkorea: Cloudflare/security block detected. Try changing IP (toggle Airplane Mode on mobile).`);
        }

        return this.parseHtml(html);
    }

    _isBlocked(html) {
        if (!html || html.length < 1000) return true;
        return html.includes('에펨코리아 보안 시스템') ||
            html.includes('Just a moment...') ||
            html.includes('cf-browser-verification');
    }

    async _fetchWithPlaywright(url) {
        let browser = null;
        try {
            browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                locale: 'ko-KR',
                timezoneId: 'Asia/Seoul',
            });
            const page = await context.newPage();

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait for the actual deal list to appear (Cloudflare challenge will resolve first)
            try {
                await page.waitForSelector('.fm_best_widget', { timeout: 20000 });
            } catch {
                // If selector doesn't appear, still try to get whatever HTML we have
                console.warn('[FMKorea] Playwright: .fm_best_widget not found, checking page content...');
            }

            // Small delay to let any remaining JS render
            await sleep(2000);

            const html = await page.content();
            await browser.close();
            browser = null;

            if (this._isBlocked(html)) {
                throw new Error('Playwright page is still blocked by Cloudflare');
            }

            return html;
        } finally {
            if (browser) {
                await browser.close().catch(() => { });
            }
        }
    }

    async parseHtml(html) {
        const $ = cheerio.load(html);
        const deals = [];
        const elements = $('.fm_best_widget ul li .li').toArray();

        for (const element of elements) {
            const titleTag = $(element).find('h3.title a');
            if (!titleTag.length) continue;

            const rawTitle = titleTag.text().trim();
            const urlPath = titleTag.attr('href') || '';
            const fullUrl = urlPath.startsWith('/') ? `https://fmkorea.com${urlPath}` : urlPath;
            const urlId = fullUrl.includes('/') ? fullUrl.split('/').pop() : 'unknown';

            const infoDiv = $(element).find('.hotdeal_info');
            let price = "0";
            let originalPrice = null;

            if (infoDiv.length) {
                const textParts = infoDiv.text().split(/[\|\n\t]/).map(s => s.trim()).filter(Boolean);
                for (const part of textParts) {
                    if ((part.includes('원') || part.includes('$') || part.match(/usd|jpy|eur/i)) && !part.includes('쇼핑몰') && !part.includes('배송') && !part.includes('원가')) {
                        price = PriceFormatter.format(part);
                    } else if (part.includes('원') && part.includes('원가')) {
                        originalPrice = part.replace(/\(원가\)/g, '').replace(/원가/g, '').trim();
                    }
                }
                if (price === "0") price = PriceFormatter.format("0");
            }

            let thumbnail = null;
            const img = $(element).find('img').first();
            if (img.length) {
                // FMKorea uses lazy loading: src is transparent.gif, real URL is in data-original
                let src = img.attr('data-original') || img.attr('data-src') || img.attr('src');
                if (src && !src.includes('transparent') && !src.includes('clear')) {
                    if (src.startsWith('//')) src = `https:${src}`;
                    else if (src.startsWith('/')) src = `https://fmkorea.com${src}`;
                    thumbnail = src;
                }
            }

            let posted_at = null;

            // Extract time from metadata area (.li_side or .author), NOT the full element text
            // This avoids matching time-like patterns in titles (e.g. "23:00 마감")
            const metaDiv = $(element).find('.li_side, .author');
            let metaText = metaDiv.length ? metaDiv.text().replace(/\s+/g, ' ') : '';

            // Try explicit class first
            let dateStr = $(element).find('.regdate, .time, .date').text().trim();
            if (!dateStr && metaText) {
                // Regex fallback on metadata area only
                const match = metaText.match(/\b(20\d{2}\.\d{2}\.\d{2}|\d{2}:\d{2})\b/);
                if (match) dateStr = match[1];
            }
            if (!dateStr) {
                // Final fallback: full element text
                const fullText = $(element).text().replace(/\s+/g, ' ');
                const match = fullText.match(/\b(20\d{2}\.\d{2}\.\d{2}|\d{2}:\d{2})\b/);
                if (match) dateStr = match[1];
            }

            if (dateStr) {
                if (dateStr.includes(':')) {
                    // "HH:mm" -> assume today in KST; if result is in the future, use yesterday
                    const now = new Date();
                    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }); // YYYY-MM-DD
                    const candidate = new Date(`${todayStr}T${dateStr}:00+09:00`);

                    // If parsed time is more than 1 minute in the future, it's likely yesterday's post
                    if (candidate.getTime() > now.getTime() + 60_000) {
                        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
                        posted_at = new Date(`${yesterdayStr}T${dateStr}:00+09:00`).toISOString();
                    } else {
                        posted_at = candidate.toISOString();
                    }
                } else if (dateStr.includes('.')) {
                    // "YYYY.MM.DD"
                    const parts = dateStr.split('.');
                    if (parts.length === 3) {
                        posted_at = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T00:00:00+09:00`).toISOString();
                    }
                }
            }

            if (!posted_at) continue;

            const hash = crypto.createHash('sha256').update(fullUrl).digest('hex');
            const deterministicId = [
                hash.substring(0, 8),
                hash.substring(8, 12),
                '5' + hash.substring(13, 16),
                'a' + hash.substring(17, 20),
                hash.substring(20, 32)
            ].join('-');

            deals.push(new Deal({
                id: deterministicId,
                deal_id: urlId,
                title: rawTitle,
                url: fullUrl,
                thumbnail,
                price,
                original_price: originalPrice,
                source: "fmkorea",
                posted_at
            }));
        }
        return deals;
    }
}
