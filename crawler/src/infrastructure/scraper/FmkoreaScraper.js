import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { ProxyAgent } from 'undici';
import { Deal } from '../../domain/deal/Deal.js';
import { Scraper } from '../../domain/deal/Scraper.js';
import { PriceFormatter } from '../../domain/deal/PriceFormatter.js';
import { execSync } from 'child_process';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export class FmkoreaScraper extends Scraper {
    async scrape() {
        const url = "https://www.fmkorea.com/hotdeal";
        const fetchOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        };

        if (process.env.PROXY_URL) {
            fetchOptions.dispatcher = new ProxyAgent(process.env.PROXY_URL);
        }

        let html = '';
        try {
            let response = await fetch(url, fetchOptions);
            if (!response.ok) {
                if (response.status === 430) throw new Error("430 Unknown");
                throw new Error(`Failed to fetch Fmkorea: ${response.status}`);
            }
            html = await response.text();
        } catch (error) {
            console.warn(`Fmkorea Node.js fetch failed (${error.message}). Falling back to curl...`);
            try {
                // Determine if we're on Windows (which uses curl.exe) or Linux/Android (which uses curl)
                const isWin = process.platform === "win32";
                const curlCmd = isWin ? 'curl.exe' : 'curl';

                // Fetch bypassing Node.js TLS signature
                const stdout = execSync(`${curlCmd} -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`, {
                    maxBuffer: 10 * 1024 * 1024,
                    encoding: 'latin1' // To prevent JS from failing on invalid UTF-8 bytes before cheerio parsing
                });

                // Convert latin1 buffer to utf8 string natively for Cheerio
                const buffer = Buffer.from(stdout, 'latin1');
                html = buffer.toString('utf8');

            } catch (curlError) {
                throw new Error(`Failed to fetch Fmkorea via curl: ${curlError.message}`);
            }
        }

        if (!html || html.length < 1000) {
            throw new Error(`Failed to fetch Fmkorea: HTML too short, possibly blocked.`);
        }

        if (html.includes('에펨코리아 보안 시스템') || html.includes('Just a moment...') || html.includes('cf-browser-verification')) {
            throw new Error(`Failed to fetch Fmkorea: Cloudflare block detected. If on mobile, try toggling Airplane Mode to change IP.`);
        }

        return this.parseHtml(html);
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
                let src = img.attr('src') || img.attr('data-original');
                if (src && !src.includes('transparent') && !src.includes('clear')) {
                    if (src.startsWith('//')) src = `https:${src}`;
                    else if (src.startsWith('/')) src = `https://fmkorea.com${src}`;
                    // Optionally strip _70_50 or similar sizing suffixes if needed, but keeping original for safety
                    thumbnail = src;
                }
            }

            let posted_at = null;
            const fullText = $(element).text().replace(/\s+/g, ' ');

            // Try explicit class first
            let dateStr = $(element).find('.regdate, .time, .date').text().trim();
            if (!dateStr) {
                // Regex fallback: looking for "HH:mm" (today) or "YYYY.MM.DD"
                const match = fullText.match(/\b(20\d{2}\.\d{2}\.\d{2}|\d{2}:\d{2})\b/);
                if (match) dateStr = match[1];
            }

            if (dateStr) {
                if (dateStr.includes(':')) {
                    // "HH:mm" -> Today
                    const now = new Date();
                    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }); // YYYY-MM-DD
                    posted_at = new Date(`${todayStr}T${dateStr}:00+09:00`).toISOString();
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
