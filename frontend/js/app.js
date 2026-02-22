import { fetchLatestDeals } from './supabase.js';
import { renderDeals, renderError } from './ui.js';

async function initApp() {
    console.log('App initialized. Fetching deals...');

    try {
        const deals = await fetchLatestDeals(20);
        console.log(`Successfully fetched ${deals.length} deals.`);
        renderDeals(deals);
    } catch (error) {
        console.error('Failed to initialize app data:', error);
        renderError(error);
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
