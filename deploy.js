const fs = require('fs');
const { createPublicClient, createWalletClient, http, getContract } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { arcTestnet } = require('viem/chains');

const USDC = '0x3600000000000000000000000000000000000000';
const EURC = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

const pk = fs.readFileSync('.env', 'utf8').match(/PRIVATE_KEY=(0x[0-9a-fA-F]+)/)[1];
const account = privateKeyToAccount(pk);
const artifact = JSON.parse(fs.readFileSync('build/MacroMarkets.json', 'utf8'));

const pub = createPublicClient({ chain: arcTestnet, transport: http() });
const wallet = createWalletClient({ account, chain: arcTestnet, transport: http() });

const ts = (y, mo, d, h = 0) => BigInt(Math.floor(Date.UTC(y, mo - 1, d, h) / 1000));

const MARKETS = [
  ['Fed funds target range raised at the Sept 15-16, 2026 FOMC meeting?', 'rates',
   'federalreserve.gov FOMC statement', USDC, ts(2026, 9, 15), ts(2026, 9, 17)],
  ['US CPI YoY >= 3.0% in the August 2026 report (BLS, Sept 2026 release)?', 'inflation',
   'bls.gov CPI news release', USDC, ts(2026, 9, 10), ts(2026, 9, 12)],
  ['ECB deposit facility rate cut at the September 2026 Governing Council meeting?', 'rates',
   'ecb.europa.eu monetary policy decisions', EURC, ts(2026, 9, 8), ts(2026, 9, 11)],
  ['EUR/USD at or above 1.10 on Dec 31, 2026 (ECB euro reference rate)?', 'fx',
   'ecb.europa.eu reference rates', USDC, ts(2026, 12, 30), ts(2026, 12, 31, 17)],
  ['Euro area flash HICP inflation >= 2.0% YoY for September 2026?', 'inflation',
   'eurostat flash estimate', EURC, ts(2026, 9, 30), ts(2026, 10, 2)],
];

(async () => {
  console.log('deployer:', account.address);
  const bal = await pub.getBalance({ address: account.address });
  console.log('native USDC balance (18d):', bal.toString());
  if (bal === 0n) { console.error('NOT FUNDED YET'); process.exit(2); }

  const hash = await wallet.deployContract({ abi: artifact.abi, bytecode: artifact.bytecode, args: [account.address] });
  console.log('deploy tx:', hash);
  const rcpt = await pub.waitForTransactionReceipt({ hash });
  const addr = rcpt.contractAddress;
  console.log('MacroMarkets deployed at:', addr);

  const c = getContract({ address: addr, abi: artifact.abi, client: { public: pub, wallet } });
  for (const m of MARKETS) {
    const h = await c.write.createMarket(m);
    await pub.waitForTransactionReceipt({ hash: h });
    console.log('market created:', m[0].slice(0, 50));
  }
  const count = await c.read.marketCount();
  console.log('marketCount:', count.toString());
  fs.writeFileSync('build/deployment.json', JSON.stringify({ address: addr, chainId: arcTestnet.id, deployTx: hash }, null, 2));
})().catch(e => { console.error(e.shortMessage || e.message); process.exit(1); });
