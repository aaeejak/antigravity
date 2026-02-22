import { fetchLatestDeals } from './supabase.js';
import { renderDeals, renderError } from './ui.js';

let allDeals = [];
let activeSource = 'all';
let activeSort = 'latest';

async function initApp() {
    console.log('App initialized. Fetching deals...');

    try {
        // Fetch a larger batch for client-side filtering
        const deals = await fetchLatestDeals(100);
        console.log(`Successfully fetched ${deals.length} deals.`);
        allDeals = deals;

        setupEventListeners();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Failed to initialize app data:', error);
        renderError(error);
    }
}

function applyFiltersAndSort() {
    // 1. Filter
    let filteredDeals = allDeals;
    if (activeSource !== 'all') {
        filteredDeals = allDeals.filter(deal => {
            const source = (deal.source || '').toLowerCase();
            // Handle variations in source naming
            if (activeSource === 'fm korea' || activeSource === 'fmkorea') {
                return source === 'fm korea' || source === 'fmkorea';
            }
            return source === activeSource;
        });
    }

    // 2. Sort
    filteredDeals.sort((a, b) => {
        if (activeSort === 'latest') {
            return new Date(b.created_at) - new Date(a.created_at);
        } else if (activeSort === 'price-asc') {
            const priceA = parsePrice(a.price);
            const priceB = parsePrice(b.price);
            return priceA - priceB;
        } else if (activeSort === 'price-desc') {
            const priceA = parsePrice(a.price);
            const priceB = parsePrice(b.price);
            return priceB - priceA;
        }
        return 0;
    });

    renderDeals(filteredDeals);
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    // Remove non-numeric characters
    const numericContent = priceStr.replace(/[^0-9]/g, '');
    return parseInt(numericContent, 10) || 0;
}

function setupEventListeners() {
    // Filter controls
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeSource = button.dataset.source;
            applyFiltersAndSort();
        });
    });

    // Sort controls
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            activeSort = e.target.value;
            applyFiltersAndSort();
        });
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
