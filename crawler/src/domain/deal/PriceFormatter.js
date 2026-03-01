export class PriceFormatter {
    static format(rawStr) {
        if (!rawStr) return '';

        const trimmed = rawStr.trim();
        if (trimmed === '무료') return '무료';
        if (trimmed === '가격 정보 없음' || trimmed === '가격정보 없음') return '가격 정보 없음';

        // Extract numbers and decimals
        // We look for numbers with optional commas and decimals
        const numberMatch = trimmed.match(/[0-9,]+(\.[0-9]+)?/);
        if (!numberMatch) {
            return trimmed;
        }

        const numStr = numberMatch[0].replace(/,/g, '');
        const numVal = parseFloat(numStr);
        if (isNaN(numVal)) return trimmed;

        // Detect currency
        const lowerStr = trimmed.toLowerCase();
        let currency = 'KRW';
        let symbol = '￦';

        if (lowerStr.includes('$') || lowerStr.includes('usd') || lowerStr.includes('달러')) {
            currency = 'USD';
            symbol = '$';
        } else if (lowerStr.includes('¥') || lowerStr.includes('jpy') || lowerStr.includes('엔')) {
            currency = 'JPY';
            symbol = '¥';
        } else if (lowerStr.includes('€') || lowerStr.includes('eur') || lowerStr.includes('유로')) {
            currency = 'EUR';
            symbol = '€';
        } else if (lowerStr.includes('£') || lowerStr.includes('gbp') || lowerStr.includes('파운드')) {
            currency = 'GBP';
            symbol = '£';
        } else {
            // Default to KRW
            currency = 'KRW';
            symbol = '￦';
        }

        // Format number
        let formattedNum = '';
        if (['USD', 'EUR', 'GBP'].includes(currency)) {
            // Usually 2 decimal places if there is a decimal
            formattedNum = numVal.toFixed(2);
            // Optional: format with commas if >= 1000
            const parts = formattedNum.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            formattedNum = parts.join('.');
        } else {
            // KRW, JPY don't use decimals
            formattedNum = Math.round(numVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        return `${symbol} ${formattedNum} (${currency})`;
    }
}
