import { describe, it, expect, vi } from 'vitest';
import { fetchLatestDeals } from '../js/supabase.js';

describe('Supabase Module', () => {
    it('throws error when credentials are missing', async () => {
        // Ensure env variables are empty or mock them if they aren't
        await expect(fetchLatestDeals()).rejects.toThrow('Supabase credentials missing');
    });
});
