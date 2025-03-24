const infura_key = "e47ec5bdf03745efa2c8fb36ae8a0a64";

const chains = [
{ id: "0x1", name: "Ethereum", mName: "eth", rpcUrl: `https://mainnet.infura.io/v3/${infura_key}`, icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png", symbol: "ETH" },
{ id: "0x38", name: "Binance Smart Chain", mName: "bsc",rpcUrl: "https://bsc.rpc.blxrbdn.com", icon: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png", symbol: "BNB" },
{ id: "0x89", name: "Polygon", mName: "polygon", rpcUrl: "https://polygon-rpc.com/", icon: "https://cryptologos.cc/logos/polygon-matic-logo.png", symbol: "POL" },
{ id: "0xa4b1", name: "Arbitrum", mName: "arbitrum", rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${infura_key}`, icon: "https://cryptologos.cc/logos/arbitrum-arb-logo.png", symbol: "ETH" },
{ id: "0xa86a", name: "Avalanche", mName: "avalanche", rpcUrl: `https://avalanche-mainnet.infura.io/v3/${infura_key}`, icon: "https://cryptologos.cc/logos/avalanche-avax-logo.png", symbol: "AVAX" },
{ id: "0xfa", name: "Fantom", mName: "fantom", rpcUrl: "https://rpc.ftm.tools/", icon: "https://cryptologos.cc/logos/fantom-ftm-logo.png", symbol: "FTM" },
{ id: "0xaa36a7", name: "Sepolia", mName: "sepolia", rpcUrl: `https://sepolia.infura.io/v3/${infura_key}`, icon: "https://cryptologos.cc/logos/ethereum-pow-ethw-logo.png", symbol: "ETH" },
{ id: "0x61", name: "BnbT", mName: "bsc-testnet", rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/", icon: "https://cryptologos.cc/logos/bnb-bnb-logo.png", symbol: "BNBt" },
];

export default chains;