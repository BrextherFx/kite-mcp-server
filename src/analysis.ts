interface Candle {
    close: number;
    date: number;
}

interface Fundamentals {
    trailingPE?: number;
    forwardPE?: number;
    priceToBook?: number;
    marketCap?: number;
    returnOnEquity?: number;
    debtToEquity?: number;
    profitMargins?: number;
    earningsGrowth?: number;
}

interface AnalysisResult {
    symbol: string;
    lastPrice: number;
    ema20: number;
    ema50: number;
    rsi14: number;
    trend: "BULLISH" | "BEARISH" | "NEUTRAL";
    rsiSignal: "OVERBOUGHT" | "OVERSOLD" | "NEUTRAL";
    fundamentals: Fundamentals;
    fundamentalNotes: string[];
    overallSignal: "BUY" | "SELL" | "HOLD";
    reasons: string[];
}

// Yahoo Finance symbol format for NSE stocks: "INFY.NS"
function toYahooSymbol(symbol: string): string {
    if (symbol.includes(".")) return symbol;
    return `${symbol}.NS`;
}

async function fetchChart(symbol: string): Promise<Candle[]> {
    const yfSymbol = toYahooSymbol(symbol);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?range=6mo&interval=1d`;

    const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error(`Failed to fetch chart data: ${res.status}`);
    const data = (await res.json()) as {
        chart?: { result?: Array<{ timestamp?: number[]; indicators?: { quote?: Array<{ close?: (number | null)[] }> } }> };
    };

    const result = data.chart?.result?.[0];
    if (!result) throw new Error("No chart data returned");

    const timestamps: number[] = result.timestamp || [];
    const rawCloses = result.indicators?.quote?.[0]?.close || [];

    const candles: Candle[] = [];
    for (let i = 0; i < timestamps.length; i++) {
        const close = rawCloses[i];
        const date = timestamps[i];
        if (close != null && date != null) {
            candles.push({ date, close });
        }
    }
    return candles;
}

async function fetchFundamentals(symbol: string): Promise<Fundamentals> {
    const yfSymbol = toYahooSymbol(symbol);
    const modules = "defaultKeyStatistics,financialData";
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yfSymbol}?modules=${modules}`;

    const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error(`Failed to fetch fundamentals: ${res.status}`);
    const data = (await res.json()) as {
        quoteSummary?: { result?: Array<{ defaultKeyStatistics?: Record<string, { raw?: number }>; financialData?: Record<string, { raw?: number }> }> };
    };

    const result = data.quoteSummary?.result?.[0];
    const stats = result?.defaultKeyStatistics || {};
    const fin = result?.financialData || {};

    return {
        trailingPE: stats?.trailingPE?.raw ?? fin?.trailingPE?.raw,
        forwardPE: stats?.forwardPE?.raw,
        priceToBook: stats?.priceToBook?.raw,
        marketCap: stats?.enterpriseValue?.raw,
        returnOnEquity: fin?.returnOnEquity?.raw,
        debtToEquity: fin?.debtToEquity?.raw,
        profitMargins: fin?.profitMargins?.raw,
        earningsGrowth: fin?.earningsGrowth?.raw,
    };
}

// ---------- Indicators ----------

function calculateEMA(closes: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema: number[] = [];
    closes.forEach((price, i) => {
        if (i === 0) {
            ema.push(price);
        } else {
            ema.push(price * k + ema[i - 1]! * (1 - k));
        }
    });
    return ema;
}

function calculateRSI(closes: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < closes.length; i++) {
        const current = closes[i]!;
        const previous = closes[i - 1]!;
        const change = current - previous;
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;

        if (i <= period) {
            gains += gain;
            losses += loss;
            if (i === period) {
                const avgGain = gains / period;
                const avgLoss = losses / period;
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                rsi[i] = 100 - 100 / (1 + rs);
            } else {
                rsi[i] = NaN;
            }
        } else {
            const prevAvgGain = gains / period;
            const prevAvgLoss = losses / period;

            const avgGain = (prevAvgGain * (period - 1) + gain) / period;
            const avgLoss = (prevAvgLoss * (period - 1) + loss) / period;

            gains = avgGain * period;
            losses = avgLoss * period;

            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi[i] = 100 - 100 / (1 + rs);
        }
    }
    return rsi;
}

// ---------- Fundamental scoring ----------

function evaluateFundamentals(f: Fundamentals): { notes: string[]; score: number } {
    const notes: string[] = [];
    let score = 0;

    if (f.trailingPE != null) {
        if (f.trailingPE > 0 && f.trailingPE < 25) {
            notes.push(`Trailing P/E (${f.trailingPE.toFixed(2)}) is reasonable.`);
            score += 1;
        } else if (f.trailingPE >= 25) {
            notes.push(`Trailing P/E (${f.trailingPE.toFixed(2)}) is high, may be overvalued.`);
            score -= 1;
        } else {
            notes.push(`Trailing P/E (${f.trailingPE.toFixed(2)}) is negative (no earnings).`);
            score -= 1;
        }
    }

    if (f.returnOnEquity != null) {
        if (f.returnOnEquity > 0.15) {
            notes.push(`Strong ROE (${(f.returnOnEquity * 100).toFixed(1)}%).`);
            score += 1;
        } else if (f.returnOnEquity < 0.05) {
            notes.push(`Weak ROE (${(f.returnOnEquity * 100).toFixed(1)}%).`);
            score -= 1;
        }
    }

    if (f.debtToEquity != null) {
        if (f.debtToEquity > 100) {
            notes.push(`High debt-to-equity (${f.debtToEquity.toFixed(1)}).`);
            score -= 1;
        } else {
            notes.push(`Manageable debt-to-equity (${f.debtToEquity.toFixed(1)}).`);
            score += 0.5;
        }
    }

    if (f.profitMargins != null) {
        if (f.profitMargins > 0.1) {
            notes.push(`Healthy profit margin (${(f.profitMargins * 100).toFixed(1)}%).`);
            score += 1;
        } else if (f.profitMargins < 0) {
            notes.push(`Negative profit margin.`);
            score -= 1;
        }
    }

    if (f.earningsGrowth != null) {
        if (f.earningsGrowth > 0) {
            notes.push(`Positive earnings growth (${(f.earningsGrowth * 100).toFixed(1)}%).`);
            score += 1;
        } else {
            notes.push(`Negative earnings growth (${(f.earningsGrowth * 100).toFixed(1)}%).`);
            score -= 1;
        }
    }

    return { notes, score };
}

// ---------- Main analysis ----------

export async function analyzeStock(symbol: string): Promise<AnalysisResult> {
    const [candles, fundamentals] = await Promise.all([
        fetchChart(symbol),
        fetchFundamentals(symbol).catch(() => ({} as Fundamentals)),
    ]);

    if (candles.length < 50) {
        throw new Error("Not enough price history to compute indicators (need at least 50 days).");
    }

    const closes = candles.map((c) => c.close);

    const ema20Series = calculateEMA(closes, 20);
    const ema50Series = calculateEMA(closes, 50);
    const rsiSeries = calculateRSI(closes, 14);

    const lastPrice = closes.at(-1);
    const ema20 = ema20Series.at(-1);
    const ema50 = ema50Series.at(-1);
    const rsi14 = rsiSeries.at(-1);

    if (lastPrice == null || ema20 == null || ema50 == null || rsi14 == null) {
        throw new Error("Failed to compute indicators from price history.");
    }

    // Trend from EMA crossover
    let trend: AnalysisResult["trend"] = "NEUTRAL";
    if (ema20 > ema50) trend = "BULLISH";
    else if (ema20 < ema50) trend = "BEARISH";

    // RSI signal
    let rsiSignal: AnalysisResult["rsiSignal"] = "NEUTRAL";
    if (rsi14 > 70) rsiSignal = "OVERBOUGHT";
    else if (rsi14 < 30) rsiSignal = "OVERSOLD";

    const { notes: fundamentalNotes, score: fundamentalScore } = evaluateFundamentals(fundamentals);

    // ---------- Combine into overall signal ----------
    const reasons: string[] = [];
    let technicalScore = 0;

    if (trend === "BULLISH") {
        technicalScore += 1;
        reasons.push("EMA20 above EMA50 (bullish trend).");
    } else if (trend === "BEARISH") {
        technicalScore -= 1;
        reasons.push("EMA20 below EMA50 (bearish trend).");
    } else {
        reasons.push("EMA20 and EMA50 are close (no clear trend).");
    }

    if (rsiSignal === "OVERSOLD") {
        technicalScore += 1;
        reasons.push(`RSI at ${rsi14.toFixed(1)} indicates oversold (potential bounce).`);
    } else if (rsiSignal === "OVERBOUGHT") {
        technicalScore -= 1;
        reasons.push(`RSI at ${rsi14.toFixed(1)} indicates overbought (potential pullback).`);
    } else {
        reasons.push(`RSI at ${rsi14.toFixed(1)} is in neutral range.`);
    }

    reasons.push(...fundamentalNotes);

    const totalScore = technicalScore + fundamentalScore;

    let overallSignal: AnalysisResult["overallSignal"] = "HOLD";
    if (totalScore >= 2) overallSignal = "BUY";
    else if (totalScore <= -2) overallSignal = "SELL";

    return {
        symbol,
        lastPrice,
        ema20,
        ema50,
        rsi14,
        trend,
        rsiSignal,
        fundamentals,
        fundamentalNotes,
        overallSignal,
        reasons,
    };
}