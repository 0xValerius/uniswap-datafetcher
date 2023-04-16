
![Logo](https://thecryptogateway.it/wp-content/uploads/2560px-Uniswap_Logo_and_Wordmark.svg.png)

## Uniswap-DataFetcher

An **EtherJS** tool to extract UniswapV3's pools price feed for **data driven LP strategies.**



## Environment Variables

To run this project, you will need to add the following variables in your `secrets.json` file:

`API_KEY` for your desired **RCP node provider** (e.g.: Alchemy or Infura).




## Available Functions
Two different functions have been currently developed to fetch UniswapV3's pools price feeds:

### rawSwapFeed()

`rawSwapFeed(poolAddress, provider, poolInterface, tokensName, nFrame, frameBlockSize)`

The following variables need to be parsed:
* `poolAddress`: address of the UniswapV3's pool of interest.
* `provider`: provider object initialized through the `etherjs` package with the RPC `API_KEY`.
* `poolInterface`: interface object initialized thrugh `etherjs` parsing the ABI json file of the standard UniswapV3 pools contract. It can be found in the npm package `@uniswap/v3-core`.
* `tokensName`: an array of two strings representing the pool's tokens names `[token0Name, token1Name]` (e.g.: `['USDC','wETH']`).
* `nFrame`: the number of queries to perform to the RPC provider requesting swaps that occured inside a specified UniswapV3's pool.
* `frameBlockSize`: the size (in term of blocks range) of each query forwarded to the RPC provider.

**Note:** `nFrame` and `frameBlockSize` must be choosen carefully in order not to overcome the Events / Logs limit imposed by the Infura or Alchemy API. If you exceed this response limit try increasing `nFrame` and decreaing `frameBlockSize`.

This function will create and save a raw `.csv` file containing the following extracted info:

blockNumber | amount of token0 | amount of token1 | tick price
| :---: | :---: | :---: | :---:
25120589  | 2778.5 | -1.0008269278035000 | 197036
...  | ...| ... | ...


### aggSwapFeed()

`aggSwapFeed(poolAddress, provider, poolInterface, tokensName, nFrame, frameBlockSize)`

The following variables need to be parsed:
* `poolAddress`: address of the UniswapV3's pool of interest.
* `provider`: provider object initialized through the `etherjs` package with the RPC `API_KEY`.
* `poolInterface`: interface object initialized thrugh `etherjs` parsing the ABI json file of the standard UniswapV3 pools contract. It can be found in the npm package `@uniswap/v3-core`.
* `tokensName`: an array of two strings representing the pool's tokens names `[token0Name, token1Name]` (e.g.: `['USDC','wETH']`).
* `nFrame`: the number of queries (and also **candlesticks**) to perform to the RPC provider requesting swaps that occured inside a specified UniswapV3's pool.
* `frameBlockSize`: the size (in term of blocks range) of each query forwarded to the RPC provider. With this function each query will be transformed into a **trading candlestick** aggregating the swaps occured at each block range.

 Each `nFrame` will query all the swaps that occured accross a block range whose size is determined by the variable `frameBlockSize`. 
 Upon retrieval of all swaps occured at this predetermined block range, the swaps feed retrieved will be aggregated and polished to extrapolate the equivalent of 
 a decentralized exchanges (**DEXs**) **trading candlestick** similiar to what occurs for centralized exchanges (**CEXs**).

 Each candlestick is made of: 
 * `blockNumber`: the first block from which the current candlestick is being built.
 * `min`: the minimum tick price at which a swap occured during this candlestick's block range.
 * `median`: the median tick price accross all the aggregated swaps occured during this candlestick's block range.
 * `max`: the maximum tick price at which a swap occured during this candlestick's block range.
 * `volume_token0`: the aggregated volume of token0 exchanged during this candlestick's block range.
 * `volume_token1`: the aggregated volume of token1 exchanged during this candlestick's block range.

Each candlestick will then be pushed inside a DataFrame with the following layout:

blockNumber | min | median | max | volume_USDC | volume_wETH
| :---: | :---: | :---: | :---: | :---: | :---: 
26473939 |	194960 | 194963	| 194966 | 66238.024223	| 19.400415499532200
...  | ...| ... | ... | ... | ...


## License

[MIT](https://choosealicense.com/licenses/mit/)

