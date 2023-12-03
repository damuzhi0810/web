import { Alert, AlertIcon, Skeleton, useToast } from '@chakra-ui/react'
import { AddressZero } from '@ethersproject/constants'
import type { AccountId } from '@shapeshiftoss/caip'
import { fromAccountId, fromAssetId, toAssetId } from '@shapeshiftoss/caip'
import type { GetFeeDataInput, UtxoBaseAdapter, UtxoChainId } from '@shapeshiftoss/chain-adapters'
import { Err, Ok, type Result } from '@sniptt/monads'
import { useQueryClient } from '@tanstack/react-query'
import { getOrCreateContractByType } from 'contracts/contractManager'
import { ContractType } from 'contracts/types'
import type { WithdrawValues } from 'features/defi/components/Withdraw/Withdraw'
import { Field, Withdraw as ReusableWithdraw } from 'features/defi/components/Withdraw/Withdraw'
import type {
  DefiParams,
  DefiQueryParams,
} from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { DefiStep } from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { useCallback, useContext, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslate } from 'react-polyglot'
import { encodeFunctionData, getAddress } from 'viem'
import { Amount } from 'components/Amount/Amount'
import type { StepComponentProps } from 'components/DeFi/components/Steps'
import { Row } from 'components/Row/Row'
import { Text } from 'components/Text'
import type { TextPropTypes } from 'components/Text/Text'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { useBrowserRouter } from 'hooks/useBrowserRouter/useBrowserRouter'
import { getSupportedEvmChainIds } from 'hooks/useEvm/useEvm'
import { useWallet } from 'hooks/useWallet/useWallet'
import type { Asset } from 'lib/asset-service'
import { BigNumber, bn, bnOrZero } from 'lib/bignumber/bignumber'
import { fromBaseUnit, toBaseUnit } from 'lib/math'
import { trackOpportunityEvent } from 'lib/mixpanel/helpers'
import { MixPanelEvents } from 'lib/mixpanel/types'
import { useRouterContractAddress } from 'lib/swapper/swappers/ThorchainSwapper/utils/useRouterContractAddress'
import { isToken } from 'lib/utils'
import { assertGetEvmChainAdapter, createBuildCustomTxInput } from 'lib/utils/evm'
import { fromThorBaseUnit } from 'lib/utils/thorchain'
import { fetchHasEnoughBalanceForTxPlusFeesPlusSweep } from 'lib/utils/thorchain/balance'
import { BASE_BPS_POINTS } from 'lib/utils/thorchain/constants'
import type { GetThorchainSaversWithdrawQuoteQueryKey } from 'lib/utils/thorchain/hooks/useGetThorchainSaversWithdrawQuoteQuery'
import {
  queryFn as getThorchainSaversWithdrawQuoteQueryFn,
  useGetThorchainSaversWithdrawQuoteQuery,
} from 'lib/utils/thorchain/hooks/useGetThorchainSaversWithdrawQuoteQuery'
import { useGetEstimatedFeesQuery } from 'pages/Lending/hooks/useGetEstimatedFeesQuery'
import { useIsSweepNeededQuery } from 'pages/Lending/hooks/useIsSweepNeededQuery'
import type { ThorchainSaversWithdrawQuoteResponseSuccess } from 'state/slices/opportunitiesSlice/resolvers/thorchainsavers/types'
import { THORCHAIN_SAVERS_DUST_THRESHOLDS_CRYPTO_BASE_UNIT } from 'state/slices/opportunitiesSlice/resolvers/thorchainsavers/utils'
import { serializeUserStakingId, toOpportunityId } from 'state/slices/opportunitiesSlice/utils'
import { isUtxoChainId } from 'state/slices/portfolioSlice/utils'
import {
  selectAccountNumberByAccountId,
  selectAssetById,
  selectAssets,
  selectEarnUserStakingOpportunityByUserStakingId,
  selectFeeAssetById,
  selectHighestBalanceAccountIdByStakingId,
  selectMarketDataById,
  selectPortfolioCryptoBalanceBaseUnitByFilter,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { ThorchainSaversWithdrawActionType } from '../WithdrawCommon'
import { WithdrawContext } from '../WithdrawContext'

type WithdrawProps = StepComponentProps & {
  accountId: AccountId | undefined
  fromAddress: string | null
}

const percentOptions = [0.25, 0.5, 0.75, 1]

export const Withdraw: React.FC<WithdrawProps> = ({ accountId, fromAddress, onNext }) => {
  const [slippageCryptoAmountPrecision, setSlippageCryptoAmountPrecision] = useState<string | null>(
    null,
  )
  const [missingFunds, setMissingFunds] = useState<string | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const { state, dispatch } = useContext(WithdrawContext)
  const translate = useTranslate()
  const toast = useToast()
  const { query, history: browserHistory } = useBrowserRouter<DefiQueryParams, DefiParams>()
  const { chainId, assetNamespace, assetReference } = query

  const queryClient = useQueryClient()
  const methods = useForm<WithdrawValues>({ mode: 'onChange' })
  const { getValues, setValue } = methods

  // Asset info

  const assets = useAppSelector(selectAssets)
  const assetId = toAssetId({
    chainId,
    assetNamespace,
    assetReference,
  })

  const accountNumberFilter = useMemo(() => ({ accountId }), [accountId])
  const accountNumber = useAppSelector(state =>
    selectAccountNumberByAccountId(state, accountNumberFilter),
  )

  const {
    state: { wallet },
  } = useWallet()
  const feeAsset = useAppSelector(state => selectFeeAssetById(state, assetId))
  const opportunityId = useMemo(
    () => (assetId ? toOpportunityId({ chainId, assetNamespace, assetReference }) : undefined),
    [assetId, assetNamespace, assetReference, chainId],
  )

  const highestBalanceAccountIdFilter = useMemo(
    () => ({ stakingId: opportunityId }),
    [opportunityId],
  )
  const highestBalanceAccountId = useAppSelector(state =>
    selectHighestBalanceAccountIdByStakingId(state, highestBalanceAccountIdFilter),
  )

  const opportunityDataFilter = useMemo(
    () => ({
      userStakingId: serializeUserStakingId(
        accountId ?? highestBalanceAccountId ?? '',
        opportunityId ?? '',
      ),
    }),
    [accountId, highestBalanceAccountId, opportunityId],
  )

  const opportunityData = useAppSelector(state =>
    selectEarnUserStakingOpportunityByUserStakingId(state, opportunityDataFilter),
  )

  const asset: Asset | undefined = useAppSelector(state => selectAssetById(state, assetId))
  if (!asset) throw new Error(`Asset not found for AssetId ${assetId}`)
  if (!feeAsset) throw new Error(`Fee Asset not found for AssetId ${assetId}`)

  const isTokenWithdraw = isToken(fromAssetId(assetId).assetReference)

  const userAddress: string | undefined = accountId && fromAccountId(accountId).account

  // user info
  const amountAvailableCryptoPrecision = useMemo(() => {
    return bnOrZero(opportunityData?.stakedAmountCryptoBaseUnit)
      .plus(bnOrZero(opportunityData?.rewardsCryptoBaseUnit?.amounts[0])) // Savers rewards are denominated in a single asset
      .div(bn(10).pow(asset.precision))
  }, [
    asset.precision,
    opportunityData?.rewardsCryptoBaseUnit,
    opportunityData?.stakedAmountCryptoBaseUnit,
  ])

  const balanceFilter = useMemo(() => ({ assetId, accountId }), [accountId, assetId])
  const balanceCryptoBaseUnit = useAppSelector(state =>
    selectPortfolioCryptoBalanceBaseUnitByFilter(state, balanceFilter),
  )

  const assetMarketData = useAppSelector(state => selectMarketDataById(state, assetId))
  const fiatAmountAvailable = useMemo(
    () => bnOrZero(amountAvailableCryptoPrecision).times(assetMarketData.price),
    [amountAvailableCryptoPrecision, assetMarketData.price],
  )

  const getOutboundFeeCryptoBaseUnit = useCallback(
    async (
      _quote?: Result<ThorchainSaversWithdrawQuoteResponseSuccess, string>,
    ): Promise<Result<string, string> | null> => {
      if (!accountId) return null

      const maybeQuote = await (async () => {
        if (
          _quote &&
          _quote.isOk() &&
          // Too small of quotes may not be able to be withdrawn, hence will not include any fees.outbound
          bnOrZero(_quote.unwrap().expected_amount_out).gt(0) &&
          _quote.unwrap().fees.outbound
        )
          return _quote

        // Attempt getting a quote with 100000 bps, i.e 100% withdraw
        // - If this succeeds, this allows us to know the oubtound fee, which is always the same regarding of the withdraw bps
        // and will allow us to gracefully handle amounts that are lower than the outbound fee
        // - If this fails, we know that the withdraw amount is too low anyway, regarding of how many bps are withdrawn
        setQuoteLoading(true)
        const thorchainSaversWithdrawQuoteQueryKey: GetThorchainSaversWithdrawQuoteQueryKey = [
          'thorchainSaversWithdrawQuote',
          { asset, accountId, withdrawBps: '10000' },
        ]

        const _thorchainSaversWithdrawQuote = await queryClient
          .fetchQuery({
            queryKey: thorchainSaversWithdrawQuoteQueryKey,
            queryFn: getThorchainSaversWithdrawQuoteQueryFn,
            staleTime: 5000,
          })
          .then(res => Ok(res))
          .catch((err: Error) => Err(err.message))
        setQuoteLoading(false)
        return _thorchainSaversWithdrawQuote
      })()

      // Neither the passed quote, nor the safer 10,000 bps quote succeeded
      // Meaning the amount being withdraw *is* too small
      if (maybeQuote.isErr()) {
        console.error(maybeQuote.unwrapErr())
        return Err(translate('trade.errors.amountTooSmallUnknownMinimum'))
      }

      const quote = maybeQuote.unwrap()

      const outboundFee = bnOrZero(
        toBaseUnit(fromThorBaseUnit(quote.fees.outbound), asset.precision),
      )
      const safeOutboundFee = bn(outboundFee).times(105).div(100).toFixed(0)
      // Add 5% as as a safety factor since the dust threshold fee is not necessarily going to cut it
      return Ok(safeOutboundFee)
    },
    [accountId, asset, queryClient, translate],
  )

  const supportedEvmChainIds = useMemo(() => getSupportedEvmChainIds(), [])

  const saversRouterContractAddress = useRouterContractAddress({
    feeAssetId: feeAsset?.assetId ?? '',
    skip: !isTokenWithdraw || !feeAsset?.assetId,
  })

  // TODO(gomes): use useGetEstimatedFeesQuery instead of this.
  // The logic of useGetEstimatedFeesQuery and its consumption will need some touching up to work with custom Txs
  // since the guts of it are made to accomodate Tx/fees/sweep fees deduction and there are !isUtxoChainId checks in place currently
  // The method below is now only used for non-UTXO chains
  const getWithdrawGasEstimateCryptoBaseUnit = useCallback(
    async (
      maybeQuote: Result<ThorchainSaversWithdrawQuoteResponseSuccess, string>,
      dustAmountCryptoBaseUnit: string,
    ): Promise<Result<string, string> | null> => {
      if (!(userAddress && accountId && wallet && accountNumber !== undefined)) return null
      const inputValues = getValues()
      try {
        const maybeOutboundFeeCryptoBaseUnit = await getOutboundFeeCryptoBaseUnit(maybeQuote)
        if (!maybeOutboundFeeCryptoBaseUnit) return null
        const amountCryptoBaseUnit = toBaseUnit(inputValues.cryptoAmount, asset.precision)

        // re-returning the outbound fee error, which should take precedence over the withdraw gas estimation one
        if (maybeOutboundFeeCryptoBaseUnit.isErr()) return maybeOutboundFeeCryptoBaseUnit

        const chainAdapters = getChainAdapterManager()

        if (isTokenWithdraw) {
          if (!saversRouterContractAddress)
            return Err(`No router contract address found for feeAsset: ${feeAsset.assetId}`)

          const adapter = assertGetEvmChainAdapter(chainId)
          const thorContract = getOrCreateContractByType({
            address: saversRouterContractAddress,
            type: ContractType.ThorRouter,
            chainId: asset.chainId,
          })

          if (maybeQuote.isErr())
            return Err(
              translate('trade.errors.amountTooSmallUnknownMinimum', {
                assetSymbol: feeAsset.symbol,
              }),
            )
          const quote = maybeQuote.unwrap()

          const data = encodeFunctionData({
            abi: thorContract.abi,
            functionName: 'depositWithExpiry',
            args: [
              getAddress(quote.inbound_address),
              // This looks incorrect according to https://dev.thorchain.org/thorchain-dev/concepts/sending-transactions#evm-chains
              // But this is how THORSwap does it, and it actually works - using the actual asset address as "asset" will result in reverts
              AddressZero,
              BigInt(amountCryptoBaseUnit),
              quote.memo,
              BigInt(quote.expiry),
            ],
          })

          const amount = THORCHAIN_SAVERS_DUST_THRESHOLDS_CRYPTO_BASE_UNIT[feeAsset.assetId]

          const customTxInput = await createBuildCustomTxInput({
            accountNumber,
            adapter,
            data,
            value: amount,
            to: saversRouterContractAddress,
            wallet,
          })

          const fees = await adapter.getFeeData({
            to: customTxInput.to,
            value: customTxInput.value,
            chainSpecific: {
              from: fromAccountId(accountId).account,
              data: customTxInput.data,
            },
          })

          const fastFeeCryptoBaseUnit = fees.fast.txFee

          return Ok(bnOrZero(fastFeeCryptoBaseUnit).toString())
        }

        // Quote errors aren't necessarily user-friendly, we don't want to return them
        if (maybeQuote.isErr()) throw new Error(maybeQuote.unwrapErr())
        const quote = maybeQuote.unwrap()
        // We're lying to Ts, this isn't always an UtxoBaseAdapter
        // But typing this as any chain-adapter won't narrow down its type and we'll have errors at `chainSpecific` property
        const adapter = chainAdapters.get(chainId) as unknown as UtxoBaseAdapter<UtxoChainId>
        const getFeeDataInput: GetFeeDataInput<UtxoChainId> = {
          to: quote.inbound_address,
          value: dustAmountCryptoBaseUnit,
          // EVM chains are the only ones explicitly requiring a `from` param for the gas estimation to work
          // UTXOs simply call /api/v1/fees (common for all accounts), and Cosmos assets fees are hardcoded
          chainSpecific: {
            pubkey: userAddress,
            from: supportedEvmChainIds.includes(chainId) ? userAddress : '',
          },
          sendMax: false,
        }
        const fastFeeCryptoBaseUnit = (await adapter.getFeeData(getFeeDataInput)).fast.txFee
        return Ok(bnOrZero(fastFeeCryptoBaseUnit).toString())
      } catch (error) {
        console.error(error)
        // Assume insufficient amount for gas if we've thrown on the try block above
        return Err(translate('common.insufficientAmountForGas', { assetSymbol: feeAsset.symbol }))
      }
    },
    [
      userAddress,
      accountId,
      wallet,
      accountNumber,
      getValues,
      getOutboundFeeCryptoBaseUnit,
      asset.precision,
      asset.chainId,
      isTokenWithdraw,
      chainId,
      supportedEvmChainIds,
      saversRouterContractAddress,
      feeAsset.assetId,
      feeAsset.symbol,
      translate,
    ],
  )

  // TODO(gomes): this will work for UTXO but is invalid for tokens since they use diff. denoms
  // the current workaround is to not do fee deduction for non-UTXO chains,
  // but for consistency, we should for native EVM assets, and ensure this is a no-op for tokens
  // Note when implementing this, fee checks/deduction will need to either be done for *native* assets only
  // or handle different denoms for tokens/native assets and display insufficientFundsForProtocolFee copy
  const getHasEnoughBalanceForTxPlusFees = useCallback(
    ({
      balanceCryptoBaseUnit,
      amountCryptoPrecision,
      txFeeCryptoBaseUnit,
      precision,
    }: {
      balanceCryptoBaseUnit: string
      amountCryptoPrecision: string
      txFeeCryptoBaseUnit: string
      precision: number
    }) => {
      const balanceCryptoBaseUnitBn = bnOrZero(balanceCryptoBaseUnit)
      if (balanceCryptoBaseUnitBn.isZero()) return false

      return bnOrZero(amountCryptoPrecision)
        .plus(fromBaseUnit(txFeeCryptoBaseUnit, precision ?? 0))
        .lte(fromBaseUnit(balanceCryptoBaseUnitBn, precision))
    },
    [],
  )

  const {
    data: thorchainSaversWithdrawQuote,
    isLoading: isThorchainSaversWithdrawQuoteLoading,
    isSuccess: isThorchainSaversWithdrawQuoteSuccess,
  } = useGetThorchainSaversWithdrawQuoteQuery({
    asset,
    accountId: accountId ?? '',
    amountCryptoBaseUnit: toBaseUnit(getValues()?.cryptoAmount, asset.precision),
  })

  const dustAmountCryptoBaseUnit = useMemo(
    () =>
      thorchainSaversWithdrawQuote
        ? toBaseUnit(fromThorBaseUnit(thorchainSaversWithdrawQuote.dust_amount), feeAsset.precision)
        : '0',
    [feeAsset.precision, thorchainSaversWithdrawQuote],
  )
  const {
    data: estimatedFeesData,
    isLoading: isEstimatedFeesDataLoading,
    isSuccess: isEstimatedFeesDataSuccess,
  } = useGetEstimatedFeesQuery({
    cryptoAmount: dustAmountCryptoBaseUnit,
    assetId,
    to: thorchainSaversWithdrawQuote?.inbound_address ?? '',
    sendMax: false,
    accountId: accountId ?? '',
    contractAddress: undefined,
    enabled: Boolean(thorchainSaversWithdrawQuote && accountId && isUtxoChainId(asset.chainId)),
  })

  const isSweepNeededArgs = useMemo(
    () => ({
      assetId,
      address: fromAddress,
      amountCryptoBaseUnit: dustAmountCryptoBaseUnit,
      txFeeCryptoBaseUnit: estimatedFeesData?.txFeeCryptoBaseUnit ?? '0',
      // Don't fetch sweep needed if there isn't enough balance for the dust amount + fees, since adding in a sweep Tx would obviously fail too
      enabled: Boolean(
        isEstimatedFeesDataSuccess &&
          isThorchainSaversWithdrawQuoteSuccess &&
          getHasEnoughBalanceForTxPlusFees({
            precision: asset.precision,
            balanceCryptoBaseUnit,
            amountCryptoPrecision: fromBaseUnit(dustAmountCryptoBaseUnit, feeAsset.precision),
            txFeeCryptoBaseUnit: estimatedFeesData?.txFeeCryptoBaseUnit ?? '',
          }),
      ),
    }),
    [
      asset.precision,
      assetId,
      balanceCryptoBaseUnit,
      dustAmountCryptoBaseUnit,
      estimatedFeesData?.txFeeCryptoBaseUnit,
      feeAsset.precision,
      fromAddress,
      getHasEnoughBalanceForTxPlusFees,
      isEstimatedFeesDataSuccess,
      isThorchainSaversWithdrawQuoteSuccess,
    ],
  )

  const { data: isSweepNeeded, isLoading: isSweepNeededLoading } =
    useIsSweepNeededQuery(isSweepNeededArgs)

  const handleContinue = useCallback(
    async (formValues: WithdrawValues) => {
      if (!(userAddress && opportunityData && accountId && dispatch)) return

      const inputValues = getValues()

      // set withdraw state for future use
      dispatch({ type: ThorchainSaversWithdrawActionType.SET_WITHDRAW, payload: formValues })
      dispatch({ type: ThorchainSaversWithdrawActionType.SET_LOADING, payload: true })
      try {
        const estimatedGasCryptoBaseUnit = await (async () => {
          if (isUtxoChainId(chainId)) return estimatedFeesData?.txFeeCryptoBaseUnit

          const { cryptoAmount } = inputValues
          const amountCryptoBaseUnit = toBaseUnit(cryptoAmount, asset.precision)
          setQuoteLoading(true)
          const thorchainSaversWithdrawQuoteQueryKey: GetThorchainSaversWithdrawQuoteQueryKey = [
            'thorchainSaversWithdrawQuote',
            { asset, accountId, amountCryptoBaseUnit },
          ]

          const quote = await queryClient.fetchQuery({
            queryKey: thorchainSaversWithdrawQuoteQueryKey,
            queryFn: getThorchainSaversWithdrawQuoteQueryFn,
            staleTime: 5000,
          })
          setQuoteLoading(false)

          const { dust_amount } = quote
          const _dustAmountCryptoBaseUnit = toBaseUnit(
            fromThorBaseUnit(dust_amount),
            asset.precision,
          )

          const maybeWithdrawGasEstimateCryptoBaseUnit = await getWithdrawGasEstimateCryptoBaseUnit(
            Ok(quote),
            _dustAmountCryptoBaseUnit,
          )
          if (!maybeWithdrawGasEstimateCryptoBaseUnit) return
          if (maybeWithdrawGasEstimateCryptoBaseUnit.isErr()) return

          return maybeWithdrawGasEstimateCryptoBaseUnit.unwrap()
        })()

        if (!estimatedGasCryptoBaseUnit) return
        dispatch({
          type: ThorchainSaversWithdrawActionType.SET_WITHDRAW,
          payload: { estimatedGasCryptoBaseUnit },
        })

        onNext(isSweepNeeded ? DefiStep.Sweep : DefiStep.Confirm)

        trackOpportunityEvent(
          MixPanelEvents.WithdrawContinue,
          {
            opportunity: opportunityData,
            fiatAmounts: [formValues.fiatAmount],
            cryptoAmounts: [{ assetId, amountCryptoHuman: formValues.cryptoAmount }],
          },
          assets,
        )
      } catch (error) {
        console.error(error)
        toast({
          position: 'top-right',
          description: translate('common.somethingWentWrongBody'),
          title: translate('common.somethingWentWrong'),
          status: 'error',
        })
      } finally {
        dispatch({ type: ThorchainSaversWithdrawActionType.SET_LOADING, payload: false })
      }
    },
    [
      userAddress,
      opportunityData,
      accountId,
      dispatch,
      getValues,
      onNext,
      isSweepNeeded,
      assetId,
      assets,
      chainId,
      estimatedFeesData?.txFeeCryptoBaseUnit,
      asset,
      queryClient,
      getWithdrawGasEstimateCryptoBaseUnit,
      toast,
      translate,
    ],
  )

  const handleCancel = useCallback(() => {
    browserHistory.goBack()
  }, [browserHistory])

  const handlePercentClick = useCallback(
    (percent: number) => {
      const cryptoAmount = bnOrZero(amountAvailableCryptoPrecision).times(percent)
      const fiatAmount = bnOrZero(cryptoAmount).times(assetMarketData.price)

      setValue(Field.FiatAmount, fiatAmount.toString(), { shouldValidate: true })
      setValue(Field.CryptoAmount, cryptoAmount.toFixed(), { shouldValidate: true })
    },
    [amountAvailableCryptoPrecision, assetMarketData, setValue],
  )

  const validateCryptoAmount = useCallback(
    async (value: string) => {
      if (!opportunityData) return false
      if (!accountId) return false
      if (!dispatch) return false

      try {
        const withdrawAmountCryptoPrecision = bnOrZero(value)
        const withdrawAmountCryptoBaseUnit = toBaseUnit(value, asset.precision)
        const amountCryptoBaseUnit = toBaseUnit(withdrawAmountCryptoPrecision, asset.precision)

        setMissingFunds(null)
        setQuoteLoading(true)

        const thorchainSaversWithdrawQuoteQueryKey: GetThorchainSaversWithdrawQuoteQueryKey = [
          'thorchainSaversWithdrawQuote',
          { asset, accountId, amountCryptoBaseUnit },
        ]

        const maybeQuote: Result<ThorchainSaversWithdrawQuoteResponseSuccess, string> =
          await queryClient
            .fetchQuery({
              queryKey: thorchainSaversWithdrawQuoteQueryKey,
              queryFn: getThorchainSaversWithdrawQuoteQueryFn,
              staleTime: 5000,
            })
            // Re-wrapping into a Result<T, E> since react-query expects promises to reject and doesn't speak monads
            .then(res => Ok(res))
            .catch((err: Error) => Err(err.message))

        const maybeOutboundFeeCryptoBaseUnit = await getOutboundFeeCryptoBaseUnit(maybeQuote)
        const quote = maybeQuote.unwrap()
        const {
          fees: { slippage_bps },
          dust_amount,
        } = quote

        const percentage = bnOrZero(slippage_bps).div(BASE_BPS_POINTS).times(100)
        // total downside (slippage going into position) - 0.007 ETH for 5 ETH deposit
        const cryptoSlippageAmountPrecision = withdrawAmountCryptoPrecision
          .times(percentage)
          .div(100)
        setSlippageCryptoAmountPrecision(cryptoSlippageAmountPrecision.toString())

        const _dustAmountCryptoBaseUnit = toBaseUnit(fromThorBaseUnit(dust_amount), asset.precision)

        const maybeWithdrawGasEstimateCryptoBaseUnit = await getWithdrawGasEstimateCryptoBaseUnit(
          maybeQuote,
          _dustAmountCryptoBaseUnit,
        )

        if (!maybeOutboundFeeCryptoBaseUnit) return false
        if (!maybeWithdrawGasEstimateCryptoBaseUnit) return false

        if (maybeWithdrawGasEstimateCryptoBaseUnit?.isErr()) {
          return maybeWithdrawGasEstimateCryptoBaseUnit.unwrapErr()
        }

        if (maybeOutboundFeeCryptoBaseUnit.isErr()) {
          return maybeOutboundFeeCryptoBaseUnit.unwrapErr()
        }

        const outboundFeeCryptoBaseUnit = maybeOutboundFeeCryptoBaseUnit.unwrap()

        const balanceCryptoPrecision = bnOrZero(amountAvailableCryptoPrecision.toPrecision())

        const hasValidBalance = await (async () => {
          // Only check for sweep + fees at this stage for UTXOs because of reconciliation - this is *not* required for EVM chains
          if (!isUtxoChainId(chainId)) {
            return (
              balanceCryptoPrecision.gt(0) &&
              withdrawAmountCryptoPrecision.gt(0) &&
              balanceCryptoPrecision.gte(withdrawAmountCryptoPrecision)
            )
          }

          const { hasEnoughBalance: hasEnoughBalanceForTxPlusFeesPlusSweep, missingFunds } =
            await fetchHasEnoughBalanceForTxPlusFeesPlusSweep({
              amountCryptoPrecision: withdrawAmountCryptoPrecision.toFixed(),
              accountId,
              asset,
              type: 'withdraw',
              fromAddress,
            })

          if (bnOrZero(missingFunds).gt(0)) setMissingFunds(missingFunds!.toFixed())

          return (
            balanceCryptoPrecision.gt(0) &&
            withdrawAmountCryptoPrecision.gt(0) &&
            hasEnoughBalanceForTxPlusFeesPlusSweep
          )
        })()
        const isBelowWithdrawThreshold = bn(withdrawAmountCryptoBaseUnit)
          .minus(outboundFeeCryptoBaseUnit)
          .lt(0)

        if (isBelowWithdrawThreshold) {
          const minLimitCryptoPrecision = bn(outboundFeeCryptoBaseUnit).div(
            bn(10).pow(asset.precision),
          )
          const minLimit = `${minLimitCryptoPrecision} ${asset.symbol}`
          return translate('trade.errors.amountTooSmall', {
            minLimit,
          })
        }

        if (withdrawAmountCryptoPrecision.isEqualTo(0)) return ''
        return hasValidBalance || 'common.insufficientFunds'
      } catch (e) {
        console.error(e)
      } finally {
        setQuoteLoading(false)
        dispatch({ type: ThorchainSaversWithdrawActionType.SET_LOADING, payload: false })
      }
    },
    [
      opportunityData,
      accountId,
      dispatch,
      asset,
      queryClient,
      getOutboundFeeCryptoBaseUnit,
      getWithdrawGasEstimateCryptoBaseUnit,
      amountAvailableCryptoPrecision,
      chainId,
      fromAddress,
      translate,
    ],
  )

  const missingFundsForGasTranslation: TextPropTypes['translation'] = useMemo(
    () => [
      'modals.confirm.missingFundsForGas',
      {
        cryptoAmountHuman: bn(missingFunds ?? 0).toFixed(6, BigNumber.ROUND_UP),
        assetSymbol: feeAsset.symbol,
      },
    ],
    [missingFunds, feeAsset.symbol],
  )

  const validateFiatAmount = useCallback(
    async (value: string) => {
      if (!(opportunityData && accountId && dispatch)) return false
      dispatch({ type: ThorchainSaversWithdrawActionType.SET_LOADING, payload: true })

      setMissingFunds(null)
      setQuoteLoading(true)
      const withdrawAmountCryptoPrecision = bnOrZero(value).div(assetMarketData.price)
      try {
        const amountAvailableCryptoPrecisionBn = bnOrZero(
          amountAvailableCryptoPrecision.toPrecision(),
        )

        const amountAvailableFiat = amountAvailableCryptoPrecisionBn.times(assetMarketData.price)
        const valueCryptoPrecision = bnOrZero(value)

        const hasValidBalance = await (async () => {
          // Only check for sweep + fees at this stage for UTXOs because of reconciliation - this is *not* required for EVM chains
          if (!isUtxoChainId(chainId)) {
            return (
              amountAvailableFiat.gt(0) &&
              valueCryptoPrecision.gt(0) &&
              amountAvailableFiat.gte(value)
            )
          }
          const { hasEnoughBalance: hasEnoughBalanceForTxPlusFeesPlusSweep, missingFunds } =
            await fetchHasEnoughBalanceForTxPlusFeesPlusSweep({
              amountCryptoPrecision: withdrawAmountCryptoPrecision.toFixed(),
              accountId,
              asset,
              type: 'withdraw',
              fromAddress,
            })

          if (bnOrZero(missingFunds).gt(0)) setMissingFunds(missingFunds!.toFixed())

          return (
            amountAvailableFiat.gt(0) &&
            valueCryptoPrecision.gt(0) &&
            amountAvailableFiat.gte(value) &&
            hasEnoughBalanceForTxPlusFeesPlusSweep
          )
        })()

        if (valueCryptoPrecision.isEqualTo(0)) return ''
        return hasValidBalance || 'common.insufficientFunds'
      } catch (e) {
        return translate('trade.errors.amountTooSmallUnknownMinimum')
      } finally {
        setQuoteLoading(false)
        dispatch({ type: ThorchainSaversWithdrawActionType.SET_LOADING, payload: false })
      }
    },
    [
      accountId,
      amountAvailableCryptoPrecision,
      asset,
      assetMarketData.price,
      chainId,
      dispatch,
      fromAddress,
      opportunityData,
      translate,
    ],
  )

  const cryptoInputValidation = useMemo(
    () => ({
      required: true,
      validate: { validateCryptoAmount },
    }),
    [validateCryptoAmount],
  )

  const fiatInputValidation = useMemo(
    () => ({
      required: true,
      validate: { validateFiatAmount },
    }),
    [validateFiatAmount],
  )

  if (!state) return null

  return (
    <FormProvider {...methods}>
      <ReusableWithdraw
        asset={asset}
        cryptoAmountAvailable={amountAvailableCryptoPrecision.toPrecision()}
        cryptoInputValidation={cryptoInputValidation}
        fiatAmountAvailable={fiatAmountAvailable.toString()}
        fiatInputValidation={fiatInputValidation}
        marketData={assetMarketData}
        onCancel={handleCancel}
        onContinue={handleContinue}
        isLoading={
          isEstimatedFeesDataLoading ||
          isSweepNeededLoading ||
          isThorchainSaversWithdrawQuoteLoading ||
          state.loading
        }
        percentOptions={percentOptions}
        enableSlippage={false}
        handlePercentClick={handlePercentClick}
      >
        <Row>
          <Row.Label>{translate('common.slippage')}</Row.Label>
          <Row.Value>
            <Skeleton isLoaded={!quoteLoading}>
              <Amount.Crypto value={slippageCryptoAmountPrecision ?? ''} symbol={asset.symbol} />
            </Skeleton>
          </Row.Value>
        </Row>
        {bnOrZero(missingFunds).gt(0) && (
          <Alert status='error' borderRadius='lg'>
            <AlertIcon />
            <Text translation={missingFundsForGasTranslation} />
          </Alert>
        )}
      </ReusableWithdraw>
    </FormProvider>
  )
}
