const { ethers, BigNumber } = require("ethers");
const cliProgress = require('cli-progress');
const dfd = require("danfojs-node");

async function aggSwapFeed(poolAddress, provider, poolInterface, tokensName, nFrame, frameBlockSize){
    console.log("... Fetching raw swaps feed for pool (%s - %s): %s ... ", tokensName[0], tokensName[1], poolAddress);
    let blockNumber = await provider.getBlockNumber();
    let aggDataFrame = []
    
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

        let ticks = [];
        let amount0 = [];
        let amount1 = [];

        // Extracting swaps event data
        for(i in eventLogs){
            let swap = poolInterface.parseLog(eventLogs[i]);

            if(swap.args.tick != undefined){
                ticks.push(swap.args.tick);
                amount0.push(Math.abs(parseFloat(ethers.utils.formatEther(swap.args.amount0.mul(10**12))))); 
                amount1.push(Math.abs(parseFloat(ethers.utils.formatEther(swap.args.amount1))));
            }
        }

        // Push fromBlock, min, median, max, volume_token0, volume_token1 into Aggregated DataFrame
        aggDataFrame.push([
            blockNumber - (steps*frameBlockSize),
            new dfd.Series(ticks).min(),
            new dfd.Series(ticks).median(),
            new dfd.Series(ticks).max(),
            new dfd.Series(amount0).sum(),
            new dfd.Series(amount1).sum(),
        ]);

        // Update progress bar value at each step
        pbar.update(1 + 1*(nFrame - steps));
    }

    // Stop progress bar
    pbar.stop();

    // Using Danfo.js to format and export aggregated swap feed data
    let df = new dfd.DataFrame(aggDataFrame, {columns: ["blockNumber", 'min', 'median', 'max',"volume_"+tokensName[0], "volume_"+tokensName[1]]});
    console.log("... Extracted block based candelstick:", df.shape[0], " ...");
    console.log("... Exporting aggregated swaps feed @ ./agg_wETH_USDC_pool_"+nFrame+"_"+frameBlockSize+".csv");
    df.toCSV({ filePath: "agg_wETH_USDC_pool_"+nFrame+"_"+frameBlockSize+".csv" });
    return df; 
}


module.exports = { aggSwapFeed };