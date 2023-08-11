import type { AssetId } from '@shapeshiftoss/caip'
import { CHAIN_NAMESPACE, fromAssetId } from '@shapeshiftoss/caip'
import type {
  CosmosSdkBaseAdapter,
  CosmosSdkChainId,
  EvmChainAdapter,
  GetFeeDataInput,
  UtxoBaseAdapter,
} from '@shapeshiftoss/chain-adapters'
import type { HDWallet } from '@shapeshiftoss/hdwallet-core'
import type { Result } from '@sniptt/monads'
import { Err, Ok } from '@sniptt/monads'
import { getConfig } from 'config'
import { getDefaultSlippagePercentageForSwapper } from 'constants/constants'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import type { BigNumber } from 'lib/bignumber/bignumber'
import { baseUnitToPrecision, bn, bnOrZero, convertPrecision } from 'lib/bignumber/bignumber'
import { fromBaseUnit, toBaseUnit } from 'lib/math'
import type {
  GetEvmTradeQuoteInput,
  GetTradeQuoteInput,
  GetUtxoTradeQuoteInput,
  ProtocolFee,
  SwapErrorRight,
  TradeQuote,
} from 'lib/swapper/api'
import { makeSwapErrorRight, SwapErrorType, SwapperName } from 'lib/swapper/api'
import { getThorTxInfo as getEvmThorTxInfo } from 'lib/swapper/swappers/ThorchainSwapper/evm/utils/getThorTxData'
import type {
  Rates,
  ThorCosmosSdkSupportedChainId,
  ThorEvmSupportedChainId,
  ThorUtxoSupportedChainId,
} from 'lib/swapper/swappers/ThorchainSwapper/types'
import {
  THOR_MINIMUM_PADDING,
  THORCHAIN_FIXED_PRECISION,
} from 'lib/swapper/swappers/ThorchainSwapper/utils/constants'
import { getInboundAddressDataForChain } from 'lib/swapper/swappers/ThorchainSwapper/utils/getInboundAddressDataForChain'
import { getQuote } from 'lib/swapper/swappers/ThorchainSwapper/utils/getQuote/getQuote'
import { getUtxoTxFees } from 'lib/swapper/swappers/ThorchainSwapper/utils/txFeeHelpers/utxoTxFees/getUtxoTxFees'
import { getThorTxInfo as getUtxoThorTxInfo } from 'lib/swapper/swappers/ThorchainSwapper/utxo/utils/getThorTxData'

import { isNativeEvmAsset } from '../../utils/helpers/helpers'
import { getEvmTxFees } from '../utils/txFeeHelpers/evmTxFees/getEvmTxFees'

export type ThorEvmTradeQuote = TradeQuote<ThorEvmSupportedChainId> & {
  router: string
  data: string
}

type ThorTradeQuote =
  | TradeQuote<ThorCosmosSdkSupportedChainId>
  | TradeQuote<ThorUtxoSupportedChainId>
  | ThorEvmTradeQuote

export const getThorTradeQuote = async (
  input: GetTradeQuoteInput & { wallet?: HDWallet },
  rates: Rates,
): Promise<Result<ThorTradeQuote, SwapErrorRight>> => {
  const {
    sellAsset,
    buyAsset,
    sellAmountIncludingProtocolFeesCryptoBaseUnit: sellAmountCryptoBaseUnit,
    slippageTolerancePercentage,
    accountNumber,
    chainId,
    receiveAddress,
    affiliateBps,
    wallet,
  } = input

  const slippageTolerance =
    slippageTolerancePercentage ?? getDefaultSlippagePercentageForSwapper(SwapperName.Thorchain)

  const { sellAssetUsdRate, buyAssetUsdRate, feeAssetUsdRate } = rates

  const { chainId: buyAssetChainId } = fromAssetId(buyAsset.assetId)

  const daemonUrl = getConfig().REACT_APP_THORCHAIN_NODE_URL
  const chainAdapterManager = getChainAdapterManager()
  const sellAdapter = chainAdapterManager.get(chainId)
  const buyAdapter = chainAdapterManager.get(buyAssetChainId)

  if (!sellAdapter || !buyAdapter) {
    return Err(
      makeSwapErrorRight({
        message: `[getThorTradeQuote] - No chain adapter found for ${chainId} or ${buyAssetChainId}.`,
        code: SwapErrorType.UNSUPPORTED_CHAIN,
        details: { sellAssetChainId: chainId, buyAssetChainId },
      }),
    )
  }

  if (!receiveAddress) {
    return Err(
      makeSwapErrorRight({
        message: '[getThorTradeQuote]: receiveAddress is required',
        code: SwapErrorType.MISSING_INPUT,
      }),
    )
  }

  const maybeQuote = await getQuote({
    sellAsset,
    buyAssetId: buyAsset.assetId,
    sellAmountCryptoBaseUnit,
    receiveAddress,
    affiliateBps,
  })

  if (maybeQuote.isErr()) return Err(maybeQuote.unwrapErr())
  const quote = maybeQuote.unwrap()
  const { fees, expected_amount_out: expectedAmountOutThorBaseUnit } = quote

  const slippagePercentage = bn(quote.slippage_bps).div(1000)

  const rate = (() => {
    const THOR_PRECISION = 8
    const sellAmountCryptoPrecision = baseUnitToPrecision({
      value: sellAmountCryptoBaseUnit,
      inputExponent: sellAsset.precision,
    })
    // All thorchain pool amounts are base 8 regardless of token precision
    const sellAmountCryptoThorBaseUnit = bn(toBaseUnit(sellAmountCryptoPrecision, THOR_PRECISION))

    return bnOrZero(expectedAmountOutThorBaseUnit).div(sellAmountCryptoThorBaseUnit).toFixed()
  })()

  const buySellAssetRate = bn(buyAssetUsdRate).div(sellAssetUsdRate)

  const maybeBuyAssetTradeFeeBuyAssetCryptoThorPrecision = fees
    ? Ok(bnOrZero(fees.outbound))
    : (await getInboundAddressDataForChain(daemonUrl, buyAsset.assetId)).andThen<BigNumber>(data =>
        Ok(bnOrZero(data?.outbound_fee)),
      )

  const buyAssetTradeFeeBuyAssetCryptoThorPrecision =
    maybeBuyAssetTradeFeeBuyAssetCryptoThorPrecision.isErr()
      ? bn(0)
      : maybeBuyAssetTradeFeeBuyAssetCryptoThorPrecision.unwrap()

  const buyAssetTradeFeeBuyAssetCryptoHuman = fromBaseUnit(
    buyAssetTradeFeeBuyAssetCryptoThorPrecision,
    THORCHAIN_FIXED_PRECISION,
  )

  const buyAssetTradeFeeBuyAssetCryptoBaseUnit = convertPrecision({
    value: buyAssetTradeFeeBuyAssetCryptoThorPrecision,
    inputExponent: THORCHAIN_FIXED_PRECISION,
    outputExponent: buyAsset.precision,
  })

  // donation is denominated in the buy asset from thor but we display it in sell asset for ux reasons
  const sellAssetTradeFeeCryptoBaseUnit = convertPrecision({
    value: fees ? fees.affiliate : '0',
    inputExponent: THORCHAIN_FIXED_PRECISION,
    outputExponent: sellAsset.precision,
  }).times(buySellAssetRate)

  // Because the expected_amount_out is the amount after fees, we need to add them back on to get the "before fees" amount
  const buyAmountCryptoBaseUnit = (() => {
    const expectedAmountOutThorBaseUnit = quote.expected_amount_out
    // Add back the outbound fees
    const expectedAmountPlusFeesCryptoThorBaseUnit = bn(expectedAmountOutThorBaseUnit)
      .plus(quote.fees.outbound)
      .plus(quote.fees.affiliate)

    return toBaseUnit(
      fromBaseUnit(expectedAmountPlusFeesCryptoThorBaseUnit, THORCHAIN_FIXED_PRECISION),
      buyAsset.precision,
    )
  })()

  const buyAssetTradeFeeUsd = bn(buyAssetUsdRate)
    .times(buyAssetTradeFeeBuyAssetCryptoHuman)
    .toString()

  const minimumSellAssetAmountCryptoHuman = bn(sellAssetUsdRate).isGreaterThan(0)
    ? bnOrZero(buyAssetTradeFeeUsd).div(sellAssetUsdRate)
    : bn(0) // We don't have a valid rate for the sell asset, there is no sane minimum

  // minimum is tradeFee padded by an amount to be sure they get something back
  // usually it will be slightly more than the amount because sellAssetTradeFee is already a high estimate
  const minimumSellAssetAmountPaddedCryptoHuman = minimumSellAssetAmountCryptoHuman
    .times(THOR_MINIMUM_PADDING)
    .toString()

  const commonQuoteFields = {
    minimumCryptoHuman: minimumSellAssetAmountPaddedCryptoHuman,
    recommendedSlippage: slippagePercentage.div(100).toString(),
  }

  const commonStepFields = {
    rate,
    sellAmountIncludingProtocolFeesCryptoBaseUnit: sellAmountCryptoBaseUnit,
    buyAmountBeforeFeesCryptoBaseUnit: buyAmountCryptoBaseUnit,
    sources: [{ name: SwapperName.Thorchain, proportion: '1' }],
    buyAsset,
    sellAsset,
    accountNumber,
  }

  const protocolFees: Record<AssetId, ProtocolFee> = {}

  if (!buyAssetTradeFeeBuyAssetCryptoBaseUnit.isZero()) {
    protocolFees[buyAsset.assetId] = {
      amountCryptoBaseUnit: buyAssetTradeFeeBuyAssetCryptoBaseUnit.toString(),
      requiresBalance: false,
      asset: buyAsset,
    }
  }

  if (!sellAssetTradeFeeCryptoBaseUnit.isZero()) {
    protocolFees[sellAsset.assetId] = {
      amountCryptoBaseUnit: sellAssetTradeFeeCryptoBaseUnit.toString(),
      requiresBalance: false,
      asset: sellAsset,
    }
  }

  const { chainNamespace } = fromAssetId(sellAsset.assetId)
  switch (chainNamespace) {
    case CHAIN_NAMESPACE.Evm:
      return (async (): Promise<Promise<Result<ThorEvmTradeQuote, SwapErrorRight>>> => {
        const maybeThorTxInfo = await getEvmThorTxInfo({
          sellAsset,
          buyAsset,
          sellAmountCryptoBaseUnit,
          slippageTolerance,
          destinationAddress: receiveAddress,
          protocolFees,
          affiliateBps,
          buyAssetUsdRate,
          feeAssetUsdRate,
        })

        if (maybeThorTxInfo.isErr()) return Err(maybeThorTxInfo.unwrapErr())
        const { data, router } = maybeThorTxInfo.unwrap()

        const maybeEvmTxFees = await getEvmTxFees({
          accountNumber,
          adapter: sellAdapter as unknown as EvmChainAdapter,
          data,
          supportsEIP1559: (input as GetEvmTradeQuoteInput).supportsEIP1559,
          router,
          value: isNativeEvmAsset(sellAsset.assetId) ? sellAmountCryptoBaseUnit : '0',
          wallet,
        })

        if (maybeEvmTxFees.isErr()) return Err(maybeEvmTxFees.unwrapErr())
        const { networkFeeCryptoBaseUnit } = maybeEvmTxFees.unwrap()

        return Ok({
          ...commonQuoteFields,
          rate,
          data,
          router,
          steps: [
            {
              ...commonStepFields,
              allowanceContract: router,
              feeData: {
                networkFeeCryptoBaseUnit,
                protocolFees,
              },
            },
          ],
        })
      })()

    case CHAIN_NAMESPACE.Utxo:
      return (async (): Promise<Result<TradeQuote<ThorUtxoSupportedChainId>, SwapErrorRight>> => {
        const maybeThorTxInfo = await getUtxoThorTxInfo({
          sellAsset,
          buyAsset,
          sellAmountCryptoBaseUnit,
          slippageTolerance,
          destinationAddress: receiveAddress,
          xpub: (input as GetUtxoTradeQuoteInput).xpub,
          protocolFees,
          affiliateBps,
          buyAssetUsdRate,
          feeAssetUsdRate,
        })

        if (maybeThorTxInfo.isErr()) return Err(maybeThorTxInfo.unwrapErr())
        const thorTxInfo = maybeThorTxInfo.unwrap()
        const { vault, opReturnData, pubkey } = thorTxInfo

        const feeData = await getUtxoTxFees({
          sellAmountCryptoBaseUnit,
          vault,
          opReturnData,
          pubkey,
          sellAdapter: sellAdapter as unknown as UtxoBaseAdapter<ThorUtxoSupportedChainId>,
          protocolFees,
        })

        return Ok({
          ...commonQuoteFields,
          rate,
          steps: [
            {
              ...commonStepFields,
              allowanceContract: '0x0', // not applicable to UTXOs
              feeData,
            },
          ],
        })
      })()
    case CHAIN_NAMESPACE.CosmosSdk:
      return (async (): Promise<
        Result<TradeQuote<ThorCosmosSdkSupportedChainId>, SwapErrorRight>
      > => {
        const getFeeDataInput: Partial<GetFeeDataInput<CosmosSdkChainId>> = {}

        const feeData = await (
          sellAdapter as unknown as CosmosSdkBaseAdapter<ThorCosmosSdkSupportedChainId>
        ).getFeeData(getFeeDataInput)

        return Ok({
          ...commonQuoteFields,
          rate,
          steps: [
            {
              ...commonStepFields,
              allowanceContract: '0x0', // not applicable to cosmos
              feeData: {
                networkFeeCryptoBaseUnit: feeData.fast.txFee,
                protocolFees,
                chainSpecific: { estimatedGasCryptoBaseUnit: feeData.fast.chainSpecific.gasLimit },
              },
            },
          ],
        })
      })()
    default:
      return Err(
        makeSwapErrorRight({
          message: '[getThorTradeQuote] - Asset chainId is not supported.',
          code: SwapErrorType.UNSUPPORTED_CHAIN,
          details: { chainId },
        }),
      )
  }
}
