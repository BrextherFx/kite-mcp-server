![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-Model_Context_Protocol-blue?style=for-the-badge)
![Zerodha](https://img.shields.io/badge/Zerodha-Kite-orange?style=for-the-badge)
![Claude](https://img.shields.io/badge/Claude-Desktop-purple?style=for-the-badge)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-success?style=for-the-badge)
# Kite MCP Trading Server
<p align="center">
  <img src="./docs/banner.png" alt="Kite MCP Server Banner" width="100%">
</p>
A powerful **Model Context Protocol (MCP) Server** built with **Bun + TypeScript** for **Zerodha Kite Connect**.

This server enables AI agents, automation workflows, and trading applications to interact with Zerodha accounts for:

* Order Execution
* Portfolio Management
* Market Data Retrieval
* Technical Analysis
* Fundamental Analysis

---

## Features

### Trading Operations

* Place Buy Orders
* Place Sell Orders
* Modify Existing Orders
* Cancel Orders
* View Order History
* Fetch Active Orders

### Portfolio Management

* Get Holdings
* Get Positions
* Calculate Profit & Loss (PnL)

### Market Data

* Live Quotes
* Last Traded Price (LTP)
* Multiple Instrument Support

### Technical Analysis

* EMA 20
* EMA 50
* RSI 14
* Trend Detection
* Buy / Sell / Hold Signals

### Fundamental Analysis

* P/E Ratio Analysis
* Price to Book Ratio
* Return on Equity (ROE)
* Debt to Equity
* Profit Margins
* Earnings Growth

---

## Technologies Used

### Runtime & Language

* Bun
* TypeScript

### Trading APIs

* Zerodha Kite Connect API
* Yahoo Finance API

### MCP

* Model Context Protocol (MCP)
* MCP SDK
* MCP Server

### Validation

* Zod
* JSON Schema

---

## Architecture

```text
Claude Desktop / Cursor / OpenAI
                │
                ▼
       Kite MCP Server
        (Bun + TypeScript)
                │
                ▼
      Zerodha Kite Connect
                │
                ▼
       Indian Stock Market
```

---

## Installation

```bash
git clone https://github.com/BrextherFx/kite-mcp-server.git

cd kite-mcp-server

bun install
```

---

## Environment Variables

Create a `.env` file:

```env
KITE_API_KEY=
KITE_API_SECRET=
KITE_REQUEST_TOKEN=
KITE_ACCESS_TOKEN=
```

---

## Running the Server

Development:

```bash
bun run dev
```

Generate Token:

```bash
bun run gen
```

Production:

```bash
bun run start
```

---

# Zerodha Kite Developer Setup

## Step 1: Create a Zerodha Trading Account

Open:

https://zerodha.com/open-account

Login:

https://kite.zerodha.com

## Step 2: Create Kite Developer Account

https://developers.kite.trade/signup

Create your developer account.

## Step 3: Create Application

Open:

https://developers.kite.trade

Create a new application.

Example:

```text
App Name: Kite MCP Server
Redirect URL: http://localhost:3000/callback
```

Save and collect:

```text
API Key
API Secret
```

## Step 4: Configure IP Whitelist

Find your public IP:

```text
https://ifconfig.me
```

Add the IP in:

```text
Developer Console
└── Profile
    └── IP Whitelist
```

## Step 5: Generate Request Token

```bash
bun run gen
```

Login using the generated URL.

Copy:

```text
request_token=xxxxxxxx
```

## Step 6: Generate Access Token

Store it inside `.env`:

```env
KITE_ACCESS_TOKEN=xxxxxxxx
```

---

# Claude Desktop Setup

Open:

```text
%APPDATA%\Claude\claude_desktop_config.json
```

Add:

```json
{
  "mcpServers": {
    "kite": {
      "command": "bun",
      "args": [
        "run",
        "C:/Projects/kite-mcp/index.ts"
      ]
    }
  }
}
```

Restart Claude Desktop.

---

## MCP Tools

| Tool          | Description                      |
| ------------- | -------------------------------- |
| buy-stock     | Place buy order                  |
| sell-stock    | Place sell order                 |
| modify-order  | Modify order                     |
| cancel-order  | Cancel order                     |
| get-orders    | Get orders                       |
| get-holdings  | Get holdings                     |
| get-positions | Get positions                    |
| get-quote     | Get live quote                   |
| get-ltp       | Get LTP                          |
| get-margins   | Get margins                      |
| get-pnl       | Calculate PnL                    |
| analyze-stock | Technical + Fundamental Analysis |

---

## Roadmap

* [ ] WebSocket Live Market Data
* [ ] Option Chain Analysis
* [ ] AI Trade Recommendations
* [ ] Portfolio Risk Analysis
* [ ] Historical Backtesting

---

## Contributing

Contributions are welcome.

Feel free to open Issues or Pull Requests.

---

## License

MIT License

---

## Author

### Momin Saad (BrextherFx)

Software Developer • AI Builder • Automation Enthusiast

🌐 Website: [brextherfx.site](https://www.brextherfx.site/)

💻 GitHub: [BrextherFx](https://github.com/BrextherFx)

Made with ❤️ by BrextherFx.

---

⭐ If you find this project useful, consider giving it a star.
