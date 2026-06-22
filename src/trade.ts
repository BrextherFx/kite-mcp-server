import { KiteConnect } from "kiteconnect";
import "dotenv/config";

const apiKey = process.env.KITE_API_KEY!;
const accessToken = process.env.KITE_ACCESS_TOKEN!;

const kc = new KiteConnect({ api_key: apiKey });
kc.setAccessToken(accessToken);

// ---------- Orders ----------

export async function placeOrder(
    tradingsymbol: string,
    qty: number,
    type: "BUY" | "SELL",
    price: number,
    orderType: "MARKET" | "LIMIT" = "LIMIT",
    product: "CNC" | "MIS" | "NRML" = "CNC"
) {
    try {
        const result = await kc.placeOrder("regular", {
            exchange: "NSE",
            tradingsymbol,
            transaction_type: type,
            quantity: qty,
            product,
            order_type: orderType,
            price: orderType === "MARKET" ? 0 : price,
        });
        console.log("Order placed:", result.order_id);
        return result;
    } catch (err) {
        console.error("Error placing order:", err);
        throw err;
    }
}

export async function modifyOrder(
    orderId: string,
    params: { quantity?: number; price?: number; order_type?: "MARKET" | "LIMIT" }
) {
    try {
        const result = await kc.modifyOrder("regular", orderId, params);
        return result;
    } catch (err) {
        console.error("Error modifying order:", err);
        throw err;
    }
}

export async function cancelOrder(orderId: string) {
    try {
        const result = await kc.cancelOrder("regular", orderId);
        return result;
    } catch (err) {
        console.error("Error cancelling order:", err);
        throw err;
    }
}

export async function getOrders() {
    try {
        return await kc.getOrders();
    } catch (err) {
        console.error("Error fetching orders:", err);
        throw err;
    }
}

export async function getOrderHistory(orderId: string) {
    try {
        return await kc.getOrderHistory(orderId);
    } catch (err) {
        console.error("Error fetching order history:", err);
        throw err;
    }
}

// ---------- Portfolio ----------

export async function getPositions() {
    try {
        return await kc.getPositions();
    } catch (err) {
        console.error("Error fetching positions:", err);
        throw err;
    }
}

export async function getHoldings() {
    try {
        return await kc.getHoldings();
    } catch (err) {
        console.error("Error fetching holdings:", err);
        throw err;
    }
}

// ---------- Market data ----------

// instruments like "NSE:INFY"
export async function getQuote(instruments: string[]) {
    try {
        return await kc.getQuote(instruments);
    } catch (err) {
        console.error("Error fetching quote:", err);
        throw err;
    }
}

export async function getLTP(instruments: string[]) {
    try {
        return await kc.getLTP(instruments);
    } catch (err) {
        console.error("Error fetching LTP:", err);
        throw err;
    }
}

// ---------- Funds / Margins ----------

export async function getMargins(segment?: "equity" | "commodity") {
    try {
        return await kc.getMargins(segment);
    } catch (err) {
        console.error("Error fetching margins:", err);
        throw err;
    }
}

// ---------- P&L ----------

// Computes a simple overall P&L from net positions (day P&L)
export async function getPnL() {
    try {
        const positions = await kc.getPositions();
        const net = positions.net || [];

        let totalPnl = 0;
        let dayPnl = 0;

        const breakdown = net.map((p: any) => {
            totalPnl += p.pnl || 0;
            dayPnl += p.day_buy_value - p.day_sell_value + (p.sell_value - p.buy_value) * 0; // placeholder
            return {
                tradingsymbol: p.tradingsymbol,
                quantity: p.quantity,
                average_price: p.average_price,
                last_price: p.last_price,
                pnl: p.pnl,
            };
        });

        return { totalPnl, breakdown };
    } catch (err) {
        console.error("Error computing PnL:", err);
        throw err;
    }
}