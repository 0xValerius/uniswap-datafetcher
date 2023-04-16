const { ethers, BigNumber } = require("ethers");
const cliProgress = require('cli-progress');
const dfd = require("danfojs-node");

async function rawSwapFeed(poolAddress, provider, poolInterface, tokensName, nFrame, frameBlockSize){
    console.log("... Fetching raw swaps feed for pool (%s - %s): %s ... ", tokensName[0], tokensName[1], poolAddress);
    let rawDataFrame = [];
    let blockNumber = await provider.getBlockNumber();

    // Initialize a new progress bar
    const pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    // Start the progress bar
    pbar.start(nFrame, 0);

    for(let steps = nFrame; steps > 0; steps--){
        // fromBlock and toBlock are inclusive, removing the last block from toBlock to avoid fetching twice the last block's swaps
        let filter = {
            address: poolAddress,
            fromBlock: blockNumber - (steps*frameBlockSize),
            toBlock: blockNumber - (steps-1)*frameBlockSize - 1,
            topic: "Swap(address, address, int256, int256, uint160, uint128, int24)"
        }

        // Filtering and fetching all swap TXs for the current blocks range
        const eventLogs = await provider.getLogs(filter);

        // Extracting swaps event data
        for(i in eventLogs){
            let swap = poolInterface.parseLog(eventLogs[i]);
            if(swap.args.tick != undefined){
                rawDataFrame.push([eventLogs[i].blockNumber, 
                    parseFloat(ethers.utils.formatEther(swap.args.amount0.mul(10**12))), 
                    parseFloat(ethers.utils.formatEther(swap.args.amount1)), 
                    swap.args.tick]);
            }
        }
        
        // Update progress bar value at each step
        pbar.update(1 + 1*(nFrame - steps));
    }

    // Stop progress bar
    pbar.stop();

    // Using Danfo.js to format and export swap feed data
    let df = new dfd.DataFrame(rawDataFrame, {columns: ["blockNumber", tokensName[0], tokensName[1], "tick"]});
    console.log("... Extracted swaps:", df.shape[0], " ...");
    console.log("... Exporting swaps feed @ ./raw_wETH_USDC_pool_1month.csv");
    df.toCSV({ filePath: "raw_wETH_USDC_pool_1month.csv" });
}


module.exports = { rawSwapFeed };