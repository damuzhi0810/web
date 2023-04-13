import type {
  ChainId as LifiChainId,
  ChainKey as LifiChainKey,
  GetStatusRequest,
  Token as LifiToken,
} from '@lifi/sdk'
import type { Asset } from '@shapeshiftoss/asset-service'
import type { AssetId, ChainId } from '@shapeshiftoss/caip'
import { fromChainId } from '@shapeshiftoss/caip'
import type { EvmChainId } from '@shapeshiftoss/chain-adapters'
import { evmChainIds } from '@shapeshiftoss/chain-adapters'
import type {
  ApprovalNeededInput,
  ApprovalNeededOutput,
  ApproveAmountInput,
  ApproveInfiniteInput,
  BuildTradeInput,
  BuyAssetBySellIdInput,
  GetEvmTradeQuoteInput,
  Swapper,
  TradeResult,
  TradeTxs,
} from '@shapeshiftoss/swapper'
import { SwapperName, SwapperType } from '@shapeshiftoss/swapper'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { toBaseUnit } from 'lib/math'
import { approvalNeeded } from 'lib/swapper/LifiSwapper/approvalNeeded/approvalNeeded'
import { approveAmount, approveInfinite } from 'lib/swapper/LifiSwapper/approve/approve'
import { buildTrade } from 'lib/swapper/LifiSwapper/buildTrade/buildTrade'
import { executeTrade } from 'lib/swapper/LifiSwapper/executeTrade/executeTrade'
import { filterAssetIdsBySellable } from 'lib/swapper/LifiSwapper/filterAssetIdsBySellable/filterAssetIdsBySellable'
import { filterBuyAssetsBySellAssetId } from 'lib/swapper/LifiSwapper/filterBuyAssetsBySellAssetId/filterBuyAssetsBySellAssetId'
import { getTradeQuote } from 'lib/swapper/LifiSwapper/getTradeQuote/getTradeQuote'
import { getUsdRate } from 'lib/swapper/LifiSwapper/getUsdRate/getUsdRate'
import { MAX_LIFI_TRADE } from 'lib/swapper/LifiSwapper/utils/constants'
import { createLifiAssetMap } from 'lib/swapper/LifiSwapper/utils/createLifiAssetMap/createLifiAssetMap'
import { createLifiChainMap } from 'lib/swapper/LifiSwapper/utils/createLifiChainMap/createLifiChainMap'
import { getLifi } from 'lib/swapper/LifiSwapper/utils/getLifi'
import { getMinimumCryptoHuman } from 'lib/swapper/LifiSwapper/utils/getMinimumCryptoHuman/getMinimumCryptoHuman'
import type {
  LifiExecuteTradeInput,
  LifiTrade,
  LifiTradeQuote,
} from 'lib/swapper/LifiSwapper/utils/types'

export class LifiSwapper implements Swapper<EvmChainId> {
  readonly name = SwapperName.LIFI
  private lifiChainMap: Map<ChainId, LifiChainKey> = new Map()
  private lifiAssetMap: Map<AssetId, LifiToken> = new Map()
  private executedTrades: Map<string, GetStatusRequest> = new Map()

  /** perform any necessary async initialization */
  async initialize(): Promise<void> {
    const supportedChainRefs = evmChainIds.map(
      chainId => Number(fromChainId(chainId).chainReference) as LifiChainId,
    )

    const { chains, tokens } = await getLifi().getPossibilities({
      include: ['chains', 'tokens'],
      chains: supportedChainRefs,
    })

    if (chains !== undefined) this.lifiChainMap = createLifiChainMap(chains)
    if (tokens !== undefined) this.lifiAssetMap = createLifiAssetMap(tokens)
  }

  /** Returns the swapper type */
  getType(): SwapperType {
    return SwapperType.LIFI
  }

  /**
   * Builds a trade with definitive rate & txData that can be executed with executeTrade
   **/
  async buildTrade(input: BuildTradeInput): Promise<LifiTrade> {
    return await buildTrade(input, this.lifiAssetMap, this.lifiChainMap)
  }

  /**
   * Get a trade quote
   */
  async getTradeQuote(input: GetEvmTradeQuoteInput): Promise<LifiTradeQuote> {
    const minimumCryptoHuman = getMinimumCryptoHuman(input.sellAsset)
    const minimumSellAmountBaseUnit = toBaseUnit(minimumCryptoHuman, input.sellAsset.precision)
    const isBelowMinSellAmount = bnOrZero(input.sellAmountBeforeFeesCryptoBaseUnit).lt(
      minimumSellAmountBaseUnit,
    )

    // TEMP: return an empty quote to allow the UI to render state where buy amount is below minimum
    // TODO: remove this when we implement monadic error handling for swapper
    // https://github.com/shapeshift/web/issues/4237
    if (isBelowMinSellAmount) {
      return {
        buyAmountCryptoBaseUnit: '0',
        sellAmountBeforeFeesCryptoBaseUnit: input.sellAmountBeforeFeesCryptoBaseUnit,
        feeData: {
          networkFeeCryptoBaseUnit: '0',
          buyAssetTradeFeeUsd: '0',
          chainSpecific: {},
        },
        rate: '0',
        sources: [],
        buyAsset: input.buyAsset,
        sellAsset: input.sellAsset,
        accountNumber: input.accountNumber,
        allowanceContract: '',
        minimumCryptoHuman: minimumCryptoHuman.toString(),
        maximumCryptoHuman: MAX_LIFI_TRADE,
      }
    }

    return await getTradeQuote(input, this.lifiAssetMap, this.lifiChainMap)
  }

  /**
   * Get the usd rate from either the assets symbol or tokenId
   */
  async getUsdRate(asset: Asset): Promise<string> {
    return await getUsdRate(asset, this.lifiAssetMap, this.lifiChainMap, getLifi())
  }

  /**
   * Execute a trade built with buildTrade by signing and broadcasting
   */
  async executeTrade(input: LifiExecuteTradeInput): Promise<TradeResult> {
    const { tradeResult, getStatusRequest } = await executeTrade(input)
    this.executedTrades.set(tradeResult.tradeId, getStatusRequest)
    return tradeResult
  }

  /**
   * Get a boolean if a quote needs approval
   */
  async approvalNeeded(input: ApprovalNeededInput<EvmChainId>): Promise<ApprovalNeededOutput> {
    return await approvalNeeded(input)
  }

  /**
   * Broadcasts an infinite approval Tx and returns the Txid
   */
  async approveInfinite(input: ApproveInfiniteInput<EvmChainId>): Promise<string> {
    return await approveInfinite(input)
  }

  /**
   * Get the txid of an approve amount transaction
   * If no amount is specified the sell amount of the quote will be used
   */
  async approveAmount(input: ApproveAmountInput<EvmChainId>): Promise<string> {
    return await approveAmount(input)
  }

  /**
   * Get supported buyAssetId's by sellAssetId
   */
  filterBuyAssetsBySellAssetId(input: BuyAssetBySellIdInput): AssetId[] {
    return filterBuyAssetsBySellAssetId(input, this.lifiAssetMap)
  }

  /**
   * Get supported sell AssetIds
   */
  filterAssetIdsBySellable(assetIds: AssetId[]): AssetId[] {
    return filterAssetIdsBySellable(assetIds, this.lifiAssetMap)
  }

  /**
   * Get transactions related to a trade
   */
  async getTradeTxs(tradeResult: TradeResult): Promise<TradeTxs> {
    const getStatusRequest = this.executedTrades.get(tradeResult.tradeId)

    if (getStatusRequest === undefined) {
      return { sellTxid: tradeResult.tradeId }
    }

    const statusResponse = await getLifi().getStatus(getStatusRequest)

    return {
      sellTxid: tradeResult.tradeId,
      buyTxid: statusResponse.receiving?.txHash,
    }
  }
}
