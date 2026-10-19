/**
 * Standardized USD Segments PnL Calculation Helper Functions (Crypto, Forex, Comex)
 */

/**
 * 1. Base Core USD Segment PnL Calculator
 */
export function findUsdInrQuote(livePrices) {
    if (!livePrices) return null;
    const direct = ['USD/INR', 'USDINR', 'USD_INR', 'FOREX:USD/INR', 'FOREX:USDINR'];
    for (const key of direct) {
        const row = livePrices[key];
        if (row && (row.bid || row.ask || row.ltp)) return row;
    }
    for (const key of Object.keys(livePrices)) {
        const compact = String(key).toUpperCase().replace(/[^A-Z]/g, '');
        if (compact === 'USDINR' || compact.endsWith('USDINR')) {
            const row = livePrices[key];
            if (row && (row.bid || row.ask || row.ltp)) return row;
        }
    }
    return null;
}

export function calculateUsdPnL({
    symbol = '',
    type,
    entryPrice,
    exitPrice,
    qty,
    qtyInput,
    lotSize = 1,
    fallbackUsdInr = 95.1,
    liveBid = null,
    liveAsk = null
}) {
    const entry = parseFloat(entryPrice || 0);
    const exit = parseFloat(exitPrice || 0);
    const lot = parseFloat(lotSize || 1);
    const quantity = parseFloat(qtyInput != null ? qtyInput : qty || 0);

    const priceDiff = (type || '').toUpperCase() === 'BUY' ? (exit - entry) : (entry - exit);
    const pnlRaw = priceDiff * lot * quantity;

    const symClean = String(symbol || '').toUpperCase().replace(/[\s\/\_\-]+/g, '');
    const isDirectInrPair = symClean.endsWith('USDINR') || symClean === 'USDINR';

    let usdInrRate = 1;
    let pnlInr = 0;
    let pnlUsd = 0;

    if (isDirectInrPair) {
        // USD/INR pair prices (e.g. 86.68 -> 105.95) are ALREADY in Indian Rupees (₹/USD).
        // PnL in INR = priceDiff * lotSize * quantity (no double conversion)
        pnlInr = pnlRaw;
        const currentRate = (liveAsk != null && !isNaN(parseFloat(liveAsk))) ? parseFloat(liveAsk) : parseFloat(fallbackUsdInr || 86.65);
        pnlUsd = currentRate > 0 ? (pnlInr / currentRate) : pnlInr;
        usdInrRate = 1;
    } else {
        // Foreign Pairs (EUR/USD, GBP/USD, BTC/USDT, XAU/USD) - prices in USD
        pnlUsd = pnlRaw;
        // Bid and ask on the quote already include the 1% spread. Use those prices.
        // Loss takes the bigger one. Profit takes the smaller one. Do not spread them again.
        const bid = parseFloat(liveBid);
        const ask = parseFloat(liveAsk);
        const hasBid = Number.isFinite(bid) && bid > 0;
        const hasAsk = Number.isFinite(ask) && ask > 0;
        if (hasBid && hasAsk) {
            usdInrRate = pnlUsd >= 0 ? Math.min(bid, ask) : Math.max(bid, ask);
        } else if (pnlUsd >= 0 && hasAsk) {
            usdInrRate = ask;
        } else if (pnlUsd < 0 && hasBid) {
            usdInrRate = bid;
        } else {
            const base = parseFloat(fallbackUsdInr || 95.1);
            usdInrRate = pnlUsd >= 0 ? base * 0.99 : base * 1.01;
        }
        pnlInr = pnlUsd * usdInrRate;
    }

    return { pnlUsd, pnlInr, usdInrRate };
}

/**
 * 2. Dedicated Crypto PnL Helper (e.g., BTC/USDT, ETH/USDT, SOL/USDT)
 */
export function calculateCryptoPnL(params) {
    return calculateUsdPnL(params);
}

/**
 * 3. Dedicated Forex PnL Helper (e.g., EUR/USD, GBP/USD, USD/INR)
 */
export function calculateForexPnL(params) {
    return calculateUsdPnL(params);
}

/**
 * 4. Dedicated Comex Commodity PnL Helper (e.g., XAU/USD Gold, XAG/USD Silver, USOIL)
 */
export function calculateComexPnL(params) {
    return calculateUsdPnL(params);
}
