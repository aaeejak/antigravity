import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Use Vite's import.meta.env or fallback to empty strings.
// The user needs to provide a .env file with these variables:
// VITE_SUPABASE_URL=...
// VITE_SUPABASE_ANON_KEY=...
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetches the latest 20 deals from Supabase
 * @param {number} limit - Number of deals to fetch (default 20)
 * @returns {Promise<Array>} List of deals
 */
export async function fetchLatestDeals(limit = 20) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn('Supabase credentials are not configured.');
        throw new Error('Supabase credentials missing. Please configure .env file.');
    }

    try {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error in fetchLatestDeals query:', error);
            throw error;
        }

        return data || [];
    } catch (err) {
        console.error('Supabase fetch failed:', err);
        throw err; // Re-throw to be handled by ui.js
    }
}
