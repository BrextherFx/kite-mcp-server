import {
    placeOrder,
    modifyOrder,
    cancelOrder,
    getOrders,
    getOrderHistory,
    getPositions,
    getHoldings,
    getQuote,
    getLTP,
    getMargins,
    getPnL,
} from "./trade";
import { analyzeStock } from "./analysis";
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

const server = new McpServer({
    name: "Kite",
    version: "1.0.1",
});

// ---------- Orders ----------

server.registerTool(
    "buy-stock",
    {
        inputSchema: z.object({
            stock: z.string(),
            qty: z.number(),
            price: z.number(),
            orderType: z.enum(["MARKET", "LIMIT"]).optional(),
            product: z.enum(["CNC", "MIS", "NRML"]).optional(),
        }),
    },
    async ({ stock, qty, price, orderType, product }) => {
        try {
            const result = await placeOrder(stock, qty, "BUY", price, orderType, product);
            return {
                content: [{ type: "text", text: `Buy order placed. Order ID: ${result.order_id}` }],
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Failed to place buy order: ${err.message}` }],
                isError: true,
            };
        }
    }
);

server.registerTool(
    "sell-stock",
    {
        inputSchema: z.object({
            stock: z.string(),
            qty: z.number(),
            price: z.number(),
            orderType: z.enum(["MARKET", "LIMIT"]).optional(),
            product: z.enum(["CNC", "MIS", "NRML"]).optional(),
        }),
    },
    async ({ stock, qty, price, orderType, product }) => {
        try {
            const result = await placeOrder(stock, qty, "SELL", price, orderType, product);
            return {
                content: [{ type: "text", text: `Sell order placed. Order ID: ${result.order_id}` }],
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Failed to place sell order: ${err.message}` }],
                isError: true,
            };
        }
    }
);

server.registerTool(
    "modify-order",
    {
        inputSchema: z.object({
            orderId: z.string(),
            quantity: z.number().optional(),
            price: z.number().optional(),
            orderType: z.enum(["MARKET", "LIMIT"]).optional(),
        }),
    },
    async ({ orderId, quantity, price, orderType }) => {
        try {
            const result = await modifyOrder(orderId, {
                quantity,
                price,
                order_type: orderType,
            });
            return { content: [{ type: "text", text: `Order modified: ${JSON.stringify(result)}` }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to modify order: ${err.message}` }], isError: true };
        }
    }
);

server.registerTool(
    "cancel-order",
    {
        inputSchema: z.object({
            orderId: z.string(),
        }),
    },
    async ({ orderId }) => {
        try {
            const result = await cancelOrder(orderId);
            return { content: [{ type: "text", text: `Order cancelled: ${JSON.stringify(result)}` }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to cancel order: ${err.message}` }], isError: true };
        }
    }
);

server.registerTool(
    "get-orders",
    {
        inputSchema: z.object({}),
    },
    async () => {
        try {
            const orders = await getOrders();
            return { content: [{ type: "text", text: JSON.stringify(orders, null, 2) }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to fetch orders: ${err.message}` }], isError: true };
        }
    }
);

server.registerTool(
    "get-order-history",
    {
        inputSchema: z.object({
            orderId: z.string(),
        }),
    },
    async ({ orderId }) => {
        try {
            const history = await getOrderHistory(orderId);
            return { content: [{ type: "text", text: JSON.stringify(history, null, 2) }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to fetch order history: ${err.message}` }], isError: true };
        }
    }
);

// ---------- Portfolio ----------

server.registerTool(
    "get-positions",
    {
        inputSchema: z.object({}),
    },
    async () => {
        try {
            const positions = await getPositions();
            return { content: [{ type: "text", text: JSON.stringify(positions, null, 2) }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to fetch positions: ${err.message}` }], isError: true };
        }
    }
);

server.registerTool(
    "get-holdings",
    {
        inputSchema: z.object({}),
    },
    async () => {
        try {
            const holdings = await getHoldings();
            return { content: [{ type: "text", text: JSON.stringify(holdings, null, 2) }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to fetch holdings: ${err.message}` }], isError: true };
        }
    }
);

// ---------- Market data ----------

server.registerTool(
    "get-quote",
    {
        inputSchema: z.object({
            instruments: z.array(z.string()).describe('e.g. ["NSE:INFY", "NSE:TCS"]'),
        }),
    },
    async ({ instruments }) => {
        try {
            const quote = await getQuote(instruments);
            return { content: [{ type: "text", text: JSON.stringify(quote, null, 2) }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to fetch quote: ${err.message}` }], isError: true };
        }
    }
);

server.registerTool(
    "get-ltp",
    {
        inputSchema: z.object({
            instruments: z.array(z.string()).describe('e.g. ["NSE:INFY", "NSE:TCS"]'),
        }),
    },
    async ({ instruments }) => {
        try {
            const ltp = await getLTP(instruments);
            return { content: [{ type: "text", text: JSON.stringify(ltp, null, 2) }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to fetch LTP: ${err.message}` }], isError: true };
        }
    }
);

// ---------- Funds ----------

server.registerTool(
    "get-margins",
    {
        inputSchema: z.object({
            segment: z.enum(["equity", "commodity"]).optional(),
        }),
    },
    async ({ segment }) => {
        try {
            const margins = await getMargins(segment);
            return { content: [{ type: "text", text: JSON.stringify(margins, null, 2) }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to fetch margins: ${err.message}` }], isError: true };
        }
    }
);

// ---------- P&L ----------

server.registerTool(
    "get-pnl",
    {
        inputSchema: z.object({}),
    },
    async () => {
        try {
            const pnl = await getPnL();
            return { content: [{ type: "text", text: JSON.stringify(pnl, null, 2) }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to compute PnL: ${err.message}` }], isError: true };
        }
    }
);

// ---------- Technical + Fundamental Analysis ----------

server.registerTool(
    "analyze-stock",
    {
        inputSchema: z.object({
            symbol: z.string().describe('Stock symbol, e.g. "INFY", "TCS", or "RELIANCE" (NSE symbols, .NS auto-appended)'),
        }),
    },
    async ({ symbol }) => {
        try {
            const result = await analyzeStock(symbol);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (err: any) {
            return { content: [{ type: "text", text: `Failed to analyze ${symbol}: ${err.message}` }], isError: true };
        }
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);