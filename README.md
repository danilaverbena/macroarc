# MacroArc

**Multi-currency macro & FX prediction markets on [Arc](https://www.arc.io), Circle's stablecoin-native L1.**

Parimutuel markets on central bank decisions, inflation prints and FX levels — settled instantly in **USDC and EURC**, with fiat-denominated gas. A market on ECB policy settles in EURC; a market on the Fed settles in USDC.

Built as a direct implementation of Circle's Arc Blueprint ["Build Institutional Grade Prediction Markets on Arc"](https://www.arc.io/blog/build-institutional-grade-prediction-markets-on-arc-arc-blueprints).

## Live on Arc Testnet

| | |
|---|---|
| Live app | https://letitwork.store |
| Contract (MacroMarkets) | [`0xff95939b9eda771188ae5be523becc2098ffdbe7`](https://testnet.arcscan.app/address/0xff95939b9eda771188ae5be523becc2098ffdbe7) |
| Chain | Arc Testnet, chain ID `5042002` |
| Settlement tokens | USDC `0x3600…0000` (native gas) · EURC `0x89B5…D72a` |
| Deploy tx | [`0x2140…3e0f`](https://testnet.arcscan.app/tx/0x21405739b3a8d81c5f8942bf9475c9aa09d6259a8efad1be706c052e1fbd3e0f) |
| Verified lifecycle (bet→resolve→claim) | [`0xb751…dac5f`](https://testnet.arcscan.app/tx/0xb7513d27b92b2db27a68ad29f0ba40bdfa82d01bdaead08dc60ac9d8f88dac5f) |

Seeded markets: FOMC Sept 2026 rate decision (USDC) · US CPI Aug 2026 (USDC) · ECB Sept 2026 deposit rate (EURC) · EUR/USD ≥ 1.10 on Dec 31, 2026 (USDC) · Euro-area flash HICP Sept 2026 (EURC).

## How it works

- **Parimutuel pools** — no order book, no market-maker dependency. Users stake YES or NO; winners split the losing pool pro-rata (1% protocol fee on winnings).
- **Implied probability as an onchain signal** — `impliedYesBps(id)` exposes market-implied odds to any contract or agent on Arc.
- **Multi-currency by design** — each market chooses its settlement stablecoin. USDC is also the gas token, so users never touch a volatile asset.
- **Explicit resolution sources** — every market names its source (BLS release, ECB reference rate, Fed statement). MVP resolves via operator; optimistic resolution module is next on the roadmap.

## Repo layout

```
contracts/MacroMarkets.sol   core protocol (parimutuel, multi-token, claims)
compile.js                   solc compilation -> build/
deploy.js                    deploy + seed markets on Arc testnet
e2e.js                       full lifecycle test against Arc testnet
site/index.html              dApp frontend (ethers v6, zero-build static)
questbook-application.md     Circle Grants application draft
```

## Run it yourself

```bash
npm install
node compile.js
echo "PRIVATE_KEY=0x..." > .env   # fund at https://faucet.circle.com (Arc Testnet)
node deploy.js
node e2e.js create && sleep 95 && node e2e.js finish
```

Frontend is a single static file — serve `site/` with anything (nginx, `python3 -m http.server`). The wallet flow auto-adds Arc Testnet (chain `0x4CEF52`).

## Roadmap

1. Optimistic resolution (propose → challenge window → escalation)
2. Full G10 macro calendar + public probability API
3. Circle Wallets (passkey onboarding) + gasless first bet
4. Arc mainnet + CCTP/Gateway funding from any chain
5. StableFX: cross-currency positions (hold USDC, trade EURC markets)

## Disclaimer

Testnet software, unaudited. Not an offer of financial services. Prediction markets may be regulated in your jurisdiction.
