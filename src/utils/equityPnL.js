/**
 * Standardized PnL Calculation Helper Function for Equity / NFO Futures & Options
 *
 * @param {Object} params
 * @param {string} params.type - 'BUY' or 'SELL'
 * @param {number} params.entryPrice - Entry/Average Buy or Sell Rate
 * @param {number} params.exitPrice - Current Market Price (CMP) or Exit Price
 * @param {number} [params.qty] - Trade quantity (may be actual_qty or total shares)
 * @param {number} [params.qtyInput] - User input quantity (Lots or Units)
 * @param {number} [params.actualQty] - Calculated total shares/units
 * @param {number} [params.lotSize=1] - Contract Lot Size (e.g. 309 for ADANIENT)
 * @param {string} [params.tradeMode] - 'UNITS' or 'LOTS'
 * @param {number|boolean} [params.equityUnitsMode] - 1 or true if trading in units/quantity
 * @returns {number} Calculated PnL
 */
export const calculateEquityPnL = ({
    type,
    entryPrice,
    exitPrice,
    qty,
    qtyInput,
    actualQty,
    lotSize = 1,
    tradeMode = null,
    equityUnitsMode = 0
}) => {
    const entry = parseFloat(entryPrice || 0);
    const exit = parseFloat(exitPrice || 0);
    const lot = parseFloat(lotSize || 1);

    const isUnitMode =
        tradeMode === 'UNITS' ||
        equityUnitsMode === 1 ||
        equityUnitsMode === true ||
        equityUnitsMode === '1' ||
        equityUnitsMode === 'true';

    // Calculate total effective shares/units
    let totalShares = 0;
    if (actualQty != null && !isNaN(parseFloat(actualQty)) && parseFloat(actualQty) > 0) {
        totalShares = parseFloat(actualQty);
    } else if (qtyInput != null && !isNaN(parseFloat(qtyInput))) {
        const qIn = parseFloat(qtyInput);
        totalShares = isUnitMode ? qIn : (qIn * lot);
    } else {
        const q = parseFloat(qty || 0);
        totalShares = q;
    }

    const priceDiff = (type || '').toUpperCase() === 'BUY' ? (exit - entry) : (entry - exit);
    return priceDiff * totalShares;
};
