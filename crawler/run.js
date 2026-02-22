import fs from 'fs';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const url = "https://www.fmkorea.com/hotdeal";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("Fetching FMKorea Hot Deals (1st page)...");
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
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
                    if (part.includes('원') && !part.includes('쇼핑몰') && !part.includes('배송') && !part.includes('원가')) {
                        price = part;
                    } else if (part.includes('원') && part.includes('원가')) {
                        originalPrice = part.replace(/\(원가\)/g, '').replace(/원가/g, '').trim();
                    }
                }
            }

            let thumbnail = null;
            try {
                const articleHtml = await fetch(fullUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                }).then(r => r.text());
                const _$ = cheerio.load(articleHtml);
                const imgs = _$('.xe_content img').toArray();
                let validSrc = null;
                for (const img of imgs) {
                    let src = _$(img).attr('src');
                    if (src && !src.includes('transparent') && !src.includes('clear')) {
                        validSrc = src;
                        break;
                    }
                }
                if (validSrc) {
                    if (validSrc.startsWith('//')) validSrc = `https:${validSrc}`;
                    else if (validSrc.startsWith('/')) validSrc = `https://fmkorea.com${validSrc}`;
                    thumbnail = validSrc;
                    console.log(`[OK] High-res image found for ${fullUrl}:`, validSrc);
                } else {
                    console.log(`[NOK] No valid high-res image for ${fullUrl}. (imgs length: ${imgs.length})`);
                }
            } catch (err) {
                console.warn(`Failed to fetch high-res image for ${fullUrl}:`, err.message);
            }

            // Fallback removed to prevent blurry 70x50 thumbnails.

            await sleep(1000); // 1초 대기

            const hash = crypto.createHash('sha256').update(fullUrl).digest('hex');
            const deterministicId = [
                hash.substring(0, 8),
                hash.substring(8, 12),
                '5' + hash.substring(13, 16),
                'a' + hash.substring(17, 20),
                hash.substring(20, 32)
            ].join('-');

            deals.push({
                id: deterministicId,
                deal_id: urlId,
                title: rawTitle,
                url: fullUrl,
                thumbnail,
                price,
                original_price: originalPrice,
                source: "fmkorea"
            });
        }

        console.log(`Parsed ${deals.length} deals.`);
        if (deals.length === 0) return;

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase credentials in .env");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log("Upserting to Supabase via RPC...");
        const { error } = await supabase.rpc('insert_deals', { deal_data: deals });

        if (error) {
            throw error;
        }

        console.log("--- Pipeline Execution Complete ---");

    } catch (e) {
        console.error("Failed to execute pipeline:", e);
    }
}

main();
