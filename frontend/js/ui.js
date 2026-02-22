/**
 * Calculates time ago text based on a date string
 * @param {string} dateString 
 * @returns {object} { text, class }
 */
function calcTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
        return { text: `${diffInMinutes}분 전`, class: 'badge-fresh' };
    } else if (diffInHours < 24) {
        return { text: `${diffInHours}시간 전`, class: 'badge-recent' };
    } else if (diffInDays === 1) {
        return { text: '어제', class: 'badge-old' };
    } else {
        return { text: `${diffInDays}일 전`, class: 'badge-old' };
    }
}

/**
 * Creates a DOM element for a deal card
 * @param {Object} deal - Deal data from Supabase
 * @returns {HTMLElement} The deal card element
 */
function createDealCard(deal) {
    const card = document.createElement('div');
    card.className = 'deal-card';

    // Image fallback logic
    const imageUrl = deal.thumbnail && deal.thumbnail !== 'no-image' ? deal.thumbnail : '';

    // Determine source badge label
    const rawSource = deal.source || 'default';
    let displayedSource = rawSource;
    if (rawSource.toLowerCase() === 'quasarzone') {
        displayedSource = '퀘이사존';
    } else if (rawSource.toLowerCase() === 'fm korea' || rawSource.toLowerCase() === 'fmkorea') {
        displayedSource = 'FM코리아';
    } else if (rawSource.toLowerCase() === 'ppomppu') {
        displayedSource = '뽐뿌';
    }

    const sourceBadgeClass = `badge-${rawSource.toLowerCase().replace(/\s/g, '-')}`;
    const timeInfo = deal.created_at ? calcTimeAgo(deal.created_at) : { text: 'Unknown', class: 'badge-old' };
    const priceText = deal.price ? deal.price : '가격 정보 없음';
    const seller = deal.store || deal.seller || ''; // Based on the target site logic

    card.innerHTML = `
        <div class="deal-thumbnail-container">
            ${imageUrl
            ? `<img src="${imageUrl}" alt="${deal.title}" class="deal-thumbnail" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyYTJhMmEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzg4OCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPiI;'">`
            : `<div class="no-image-placeholder">No Image</div>`
        }
            ${seller ? `<span class="deal-selling-site">${seller}</span>` : ''}
        </div>
        
        <div class="deal-info">
            <a href="${deal.url}" target="_blank" rel="noopener noreferrer" class="deal-title">${deal.title}</a>
            <div class="deal-meta">
                <span class="badge-source ${sourceBadgeClass}">${displayedSource}</span>
                ${deal.category ? `<span class="badge-category">${deal.category}</span>` : ''}
                <span class="badge-time ${timeInfo.class}">${timeInfo.text}</span>
            </div>
            <div class="deal-price">${priceText}</div>
        </div>
    `;

    return card;
}

/**
 * Renders the list of deals into the DOM
 * @param {Array} deals - Array of deal objects
 */
export function renderDeals(deals) {
    const container = document.getElementById('deals-container');

    if (!container) {
        console.error('Container #deals-container not found');
        return;
    }

    // Clear loading or existing content
    container.innerHTML = '';

    if (!deals || deals.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-color); grid-column: 1 / -1; padding: 2rem;">
                등록된 핫딜이 없습니다.
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
    const container = document.getElementById('deals-container');
    if (!container) return;

    const message = typeof error === 'string' ? error : error.message || 'An unknown error occurred';

    container.innerHTML = `
        <div style="grid-column: 1/-1; color: var(--danger-color); text-align: center; padding: 2rem;">
            <strong>Error loading deals:</strong><br>
            ${message}
            <br><br>
            <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; border-radius: 4px; background: white; color: red; border: none; cursor: pointer; font-weight: bold; margin-top: 10px;">Retry</button>
        </div>
    `;
}

