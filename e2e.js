// End-to-end lifecycle test on Arc testnet:
// create short-lived test market -> bet YES -> wait close -> resolve YES -> claim -> verify payout
const fs = require('fs');
const { createPublicClient, createWalletClient, http, getContract, erc20Abi } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { arcTestnet } = require('viem/chains');

const USDC = '0x3600000000000000000000000000000000000000';
const pk = fs.readFileSync('.env', 'utf8').match(/PRIVATE_KEY=(0x[0-9a-fA-F]+)/)[1];
const account = privateKeyToAccount(pk);
const { abi } = JSON.parse(fs.readFileSync('build/MacroMarkets.json', 'utf8'));
const { address } = JSON.parse(fs.readFileSync('build/deployment.json', 'utf8'));

const pub = createPublicClient({ chain: arcTestnet, transport: http() });
const wallet = createWalletClient({ account, chain: arcTestnet, transport: http() });
const c = getContract({ address, abi, client: { public: pub, wallet } });
const usdc = getContract({ address: USDC, abi: erc20Abi, client: { public: pub, wallet } });
const w = async (h) => pub.waitForTransactionReceipt({ hash: h });

(async () => {
  const step = process.argv[2] || 'all';
  if (step === 'create') {
    const now = Math.floor(Date.now() / 1000);
    let h = await c.write.createMarket(['TEST lifecycle market', 'test', 'n/a', USDC, BigInt(now + 90), BigInt(now + 91)]);
    await w(h);
    const id = (await c.read.marketCount()) - 1n;
    console.log('test market id:', id.toString());
    h = await usdc.write.approve([address, 5_000_000n]); await w(h);
    h = await c.write.bet([id, true, 2_000_000n]); await w(h); // 2 USDC on YES
    const m = await c.read.getMarket([id]);
    console.log('yesPool:', m.yesPool.toString(), '(expect 2000000)');
    fs.writeFileSync('build/e2e.json', JSON.stringify({ id: id.toString() }));
    console.log('now wait ~95s then run: node e2e.js finish');
  } else if (step === 'finish') {
    const { id } = JSON.parse(fs.readFileSync('build/e2e.json', 'utf8'));
    const balBefore = await usdc.read.balanceOf([account.address]);
    let h = await c.write.resolve([BigInt(id), 1]); await w(h); // YES
    h = await c.write.claim([BigInt(id)]); const rc = await w(h);
    const balAfter = await usdc.read.balanceOf([account.address]);
    console.log('claim tx:', h, 'status:', rc.status);
    console.log('USDC delta:', (balAfter - balBefore).toString(), '(expect +2000000: stake back, no losing pool)');
    const m = await c.read.getMarket([BigInt(id)]);
    console.log('outcome:', m.outcome.toString(), '(expect 1)');
  }
})().catch(e => { console.error(e.shortMessage || e.message); process.exit(1); });
