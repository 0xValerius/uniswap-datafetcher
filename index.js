const { ethers, BigNumber } = require("ethers");
const secrets = require('./secrets.json');
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const dfd = require("danfojs-node");
const { rawSwapFeed } = require('./utils/rawSwapFeed');
const { aggSwapFeed } = require("./utils/aggSwapFeed");

const provider = new ethers.providers.JsonRpcProvider(secrets.Alchemy_API_KEY);
const wallet = new ethers.Wallet(secrets.keeper);
const signer = wallet.connect(provider);

// Polygon - wETH/USDC pool address
const poolAddress = "0x45dda9cb7c25131df268515131f647d726f50608";

async function main(){
    console.log("### Running Uniswap-DataFetcher ###");
    let poolInterface = new ethers.utils.Interface(IUniswapV3Pool.abi);

    await rawSwapFeed(poolAddress, provider, poolInterface, ['USDC','wETH'], 120, 10000);
    await aggSwapFeed(poolAddress, provider, poolInterface, ['USDC', 'wETH'], 12, 150);

}

main();
