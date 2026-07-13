const solc = require('solc');
const fs = require('fs');

const source = fs.readFileSync('contracts/MacroMarkets.sol', 'utf8');
const input = {
  language: 'Solidity',
  sources: { 'MacroMarkets.sol': { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
  },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (out.errors || []).filter(e => e.severity === 'error');
if (errors.length) { console.error(errors.map(e => e.formattedMessage).join('\n')); process.exit(1); }
const c = out.contracts['MacroMarkets.sol']['MacroMarkets'];
fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/MacroMarkets.json', JSON.stringify({ abi: c.abi, bytecode: '0x' + c.evm.bytecode.object }, null, 2));
console.log('compiled OK, bytecode bytes:', c.evm.bytecode.object.length / 2);
