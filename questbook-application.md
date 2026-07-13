# MacroArc — Multi-Currency Macro & FX Prediction Markets on Arc

## One-liner

Capital-efficient prediction markets on central bank decisions, inflation prints, and FX levels, with instant multi-currency settlement in USDC and EURC — built natively on Arc.

## The problem

Prediction markets have quadrupled in volume over two years, but macro/FX coverage remains thin and structurally US-centric. Polymarket and Kalshi concentrate on US events, settle exclusively in USD, and are inaccessible or irrelevant to users whose economic reality is priced in euros or emerging-market currencies. Meanwhile, institutions increasingly cite market-implied probabilities from prediction markets (the Fed itself published research on Kalshi-based macro signals in 2026) — yet no venue offers multi-currency macro markets with onchain, deterministic settlement.

## The solution

MacroArc is a parimutuel prediction-market protocol purpose-built for macroeconomic and FX outcomes:

- **Markets that match the macro calendar**: FOMC and ECB rate decisions, US CPI and euro-area HICP prints, FX reference-rate levels — each with an explicit resolution source (BLS release, ECB reference rate, Fed statement).
- **Multi-currency settlement**: a market on ECB policy settles in EURC; a market on the Fed settles in USDC. Users hold exposure in the currency the outcome is denominated in — impossible on any existing venue.
- **Parimutuel design**: no order book, no market-maker dependency, capital-efficient from day one; implied probabilities are readable directly from pool ratios as a public onchain signal.
- **Signal feed as a public good**: every market doubles as an oracle of market-implied probabilities (implied probability exposed onchain per market), consumable by other Arc protocols, agents, and analysts.

This is a direct build-out of Circle's own Arc Blueprint, "Build Institutional Grade Prediction Markets on Arc" (May 2026), and targets the one focus category of the Circle Grants Program with no grantee in the first 2026 cohort.

## Why Arc — platform alignment

Arc is core to the product, not a deployment target of convenience:

- **USDC as native gas** — participants never need a volatile gas token; a $5 position costs predictable, fiat-denominated fees. This is what makes small-stake macro forecasting economically viable.
- **EURC as a first-class settlement asset** — multi-currency market design (USDC + EURC pools) exists because Arc treats both as native stablecoins.
- **Deterministic, sub-second finality** — bets and claims settle with the immediacy macro event trading requires (positions around a data release are time-sensitive).
- **Native FX roadmap (StableFX)** — as Arc's onchain FX ships, MacroArc will let a USDC holder take a position in an EURC market with inline conversion, making it a genuine FX-utility application.
- **Compliance-ready architecture** — Arc's opt-in privacy and policy controls map to our roadmap for institution-gated markets.

## What is already live (traction)

- **Deployed and working on Arc public testnet**: [CONTRACT_ADDRESS — link to ArcScan]
- **Live web app**: [APP_URL]
- Five seeded markets across rates / inflation / FX in both USDC and EURC.
- Full lifecycle verified onchain: market creation → positions → resolution → claims (transaction links: [TX_LINKS]).
- Stack: Solidity (audited-pattern parimutuel core), viem/ethers, static-hosted dApp; wallet flow auto-configures Arc testnet.

## Circle product integrations

| Product | Status |
|---|---|
| Arc (testnet) | Live — core settlement layer |
| USDC (native gas + settlement) | Live |
| EURC (settlement) | Live |
| Circle Wallets (embedded, email/passkey onboarding) | Milestone 2 |
| CCTP v2 (fund positions from any chain) | Milestone 3 |
| Gateway (unified USDC balance) | Milestone 3 |
| StableFX (inline FX for cross-currency positions) | Milestone 4 / Arc mainnet |

## Milestones

**M1 — Production-grade testnet protocol (weeks 1–4)**
- Optimistic resolution module (propose → challenge window → escalation) replacing owner resolution
- Market-creation pipeline covering the full G10 macro calendar (FOMC, ECB, BoE, BoJ, CPI/HICP, NFP)
- Public probability API + embeddable widgets (market-implied odds as a data product)
- Deliverable: 20+ live markets, open-source repo, protocol documentation

**M2 — Frictionless onboarding (weeks 5–8)**
- Circle Wallets integration: email/passkey onboarding, no seed phrases
- Gasless first bet via paymaster flow
- Mobile-first UI, localized market templates (EU inflation in EURC, EM central banks)
- Deliverable: onboarding-to-first-position under 2 minutes, measured

**M3 — Arc mainnet launch (aligned with mainnet GA)**
- Audited contracts deployed to Arc mainnet
- CCTP v2 + Gateway: fund positions with USDC from any supported chain
- Target: 1,000 positions / $250k cumulative volume in first quarter post-launch
- Deliverable: production deployment, audit report, volume dashboard

**M4 — FX & institutional layer**
- StableFX integration: cross-currency positions (hold USDC, trade EURC markets)
- Institution-gated markets with identity controls (Arc compliance primitives)
- Historical probability dataset + API for researchers and trading desks
- Deliverable: signed pilot with at least one data consumer / research partner

## Ecosystem impact

- First macro/FX prediction market on Arc — fills a declared focus category of this grant program
- Onchain market-implied probability feeds become public infrastructure other Arc builders (lending protocols pricing rate risk, agents hedging FX) can consume
- EURC utility: one of the few applications giving EURC a native, recurring transactional use case
- Open-source parimutuel + optimistic-resolution stack reusable by any Arc event-market builder

## Team

[Solo builder / team background — proven shipping ability: this application is accompanied by a working product built and deployed to Arc testnet, end-to-end, within days of concept.]

## Funding request

[Amount in USDC] tied to the milestones above, disbursed per Circle's milestone-based schedule.
