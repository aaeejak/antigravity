/**
 * Creates a DOM element for a deal card
 * @param {Object} deal - Deal data from Supabase
 * @returns {HTMLElement} The deal card element
 */
function createDealCard(deal) {
    const card = document.createElement('div');
    card.className = 'deal-card';

    // Determine fallback image based on source or use a generic one
    const fallbackImages = {
        'fmkorea': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=400',
        'ruliweb': 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=400',
        'default': 'https://images.unsplash.com/photo-1607082350899-7e105aa886b4?auto=format&fit=crop&q=80&w=400'
    };

    const sourceKey = deal.source ? deal.source.toLowerCase() : 'default';
    const imageUrl = fallbackImages[sourceKey] || fallbackImages['default'];

    // Format date
    const date = new Date(deal.created_at);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    // Format price
    const priceText = deal.price ? deal.price : '가격 정보 없음';

    card.innerHTML = `
        <a href="${deal.url}" target="_blank" rel="noopener noreferrer" class="deal-image-wrap">
            <img src="${imageUrl}" alt="${deal.title}" class="deal-image" loading="lazy" onerror="this.src='${fallbackImages['default']}'">
        </a>
        <div class="deal-content">
            <h3 class="deal-title" title="${deal.title}">${deal.title}</h3>
            <div class="deal-price">${priceText}</div>
            <div class="deal-meta">
                <span class="deal-source">from ${deal.source}</span>
                <span class="deal-time">${dateStr}</span>
            </div>
            <a href="${deal.url}" target="_blank" rel="noopener noreferrer" class="deal-button">View Deal</a>
        </div>
    `;

    return card;
}

/**
 * Renders the list of deals into the DOM
 * @param {Array} deals - Array of deal objects
 */
export function renderDeals(deals) {
    const container = document.getElementById('deal-list');

    if (!container) {
        console.error('Container #deal-list not found');
        return;
    }

    // Clear loading or existing content
    container.innerHTML = '';

    if (!deals || deals.length === 0) {
        container.innerHTML = `
            <div class="placeholder-text">
                No active deals found at the moment.<br>Check back later!
            </div>
        `;
        return;
    }

    // Append each deal
    deals.forEach(deal => {
        const card = createDealCard(deal);
        container.appendChild(card);
    });
}

/**
 * Renders an error message
 * @param {Error|string} error - The error to display
 */
export function renderError(error) {
    const container = document.getElementById('deal-list');
    if (!container) return;

    const message = typeof error === 'string' ? error : error.message || 'An unknown error occurred';

    container.innerHTML = `
        <div class="error-message">
            <strong>Error loading deals:</strong><br>
            ${message}
            <br><br>
            <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; border-radius: 4px; background: white; color: var(--color-danger); border: none; cursor: pointer; font-weight: bold; margin-top: 10px;">Retry</button>
        </div>
    `;
}
