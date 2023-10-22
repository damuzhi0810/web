import { Stack } from '@chakra-ui/react'
import type { AccountId } from '@shapeshiftoss/caip'
import { toAssetId } from '@shapeshiftoss/caip'
import type { WithdrawValues } from 'features/defi/components/Withdraw/Withdraw'
import { Withdraw as ReusableWithdraw } from 'features/defi/components/Withdraw/Withdraw'
import type {
  DefiParams,
  DefiQueryParams,
} from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { DefiStep } from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { useFoxFarming } from 'features/defi/providers/fox-farming/hooks/useFoxFarming'
import { useCallback, useContext, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { AccountDropdownProps } from 'components/AccountDropdown/AccountDropdown'
import { Amount } from 'components/Amount/Amount'
import { AssetIcon } from 'components/AssetIcon'
import type { StepComponentProps } from 'components/DeFi/components/Steps'
import { Text } from 'components/Text'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { useBrowserRouter } from 'hooks/useBrowserRouter/useBrowserRouter'
import { bn, bnOrZero } from 'lib/bignumber/bignumber'
import { fromBaseUnit } from 'lib/math'
import { trackOpportunityEvent } from 'lib/mixpanel/helpers'
import { MixPanelEvents } from 'lib/mixpanel/types'
import { assertIsFoxEthStakingContractAddress } from 'state/slices/opportunitiesSlice/constants'
import { serializeUserStakingId, toOpportunityId } from 'state/slices/opportunitiesSlice/utils'
import {
  selectAssetById,
  selectAssets,
  selectEarnUserStakingOpportunityByUserStakingId,
  selectMarketDataById,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { FoxFarmingWithdrawActionType } from '../WithdrawCommon'
import { WithdrawContext } from '../WithdrawContext'

type ExpiredWithdrawProps = StepComponentProps & {
  accountId?: AccountId | undefined
  onAccountIdChange: AccountDropdownProps['onChange']
}

const percentOptionsEmpty: number[] = []

export const ExpiredWithdraw: React.FC<ExpiredWithdrawProps> = ({
  accountId,
  onAccountIdChange: handleAccountIdChange,
  onNext,
}) => {
  const { state, dispatch } = useContext(WithdrawContext)
  const { history: browserHistory, query } = useBrowserRouter<DefiQueryParams, DefiParams>()
  const { assetNamespace, chainId, contractAddress, rewardId } = query

  const assets = useAppSelector(selectAssets)

  const opportunity = useAppSelector(state =>
    selectEarnUserStakingOpportunityByUserStakingId(state, {
      userStakingId: serializeUserStakingId(
        accountId ?? '',
        toOpportunityId({
          chainId,
          assetNamespace,
          assetReference: contractAddress,
        }),
      ),
    }),
  )

  assertIsFoxEthStakingContractAddress(contractAddress)

  const { getUnstakeFees, allowance, getApproveFees } = useFoxFarming(contractAddress)

  const methods = useForm<WithdrawValues>({ mode: 'onChange' })

  const asset = useAppSelector(state =>
    selectAssetById(state, opportunity?.underlyingAssetId ?? ''),
  )
  const feeAssetId = getChainAdapterManager().get(chainId)?.getFeeAssetId()
  if (!feeAssetId) throw new Error(`Fee AssetId not found for ChainId ${chainId}`)
  const feeAsset = useAppSelector(state => selectAssetById(state, feeAssetId))
  if (!feeAsset) throw new Error(`Asset not found for AssetId ${feeAssetId}`)

  const rewardAssetId = toAssetId({ chainId, assetNamespace, assetReference: rewardId })
  const rewardAsset = useAppSelector(state => selectAssetById(state, rewardAssetId))
  if (!rewardAsset) throw new Error(`Asset not found for AssetId ${rewardAssetId}`)

  const lpMarketData = useAppSelector(state =>
    selectMarketDataById(state, opportunity?.underlyingAssetId ?? ''),
  )

  // user info
  const rewardAmountCryptoPrecision = useMemo(
    () =>
      fromBaseUnit(
        bnOrZero(opportunity?.rewardsCryptoBaseUnit?.amounts[0]),
        assets[opportunity?.underlyingAssetId ?? '']?.precision ?? 0,
      ),
    [assets, opportunity?.rewardsCryptoBaseUnit, opportunity?.underlyingAssetId],
  )

  const amountAvailableCryptoPrecision = useMemo(
    () => fromBaseUnit(bnOrZero(opportunity?.cryptoAmountBaseUnit), asset?.precision ?? 18),
    [asset?.precision, opportunity?.cryptoAmountBaseUnit],
  )
  const totalFiatBalance = opportunity?.fiatAmount

  const getWithdrawGasEstimate = useCallback(async () => {
    try {
      const fees = await getUnstakeFees(amountAvailableCryptoPrecision, true)
      if (!fees) return
      return fromBaseUnit(fees.networkFeeCryptoBaseUnit, feeAsset.precision)
    } catch (error) {
      // TODO: handle client side errors maybe add a toast?
      console.error(error)
    }
  }, [amountAvailableCryptoPrecision, feeAsset.precision, getUnstakeFees])

  const handleContinue = useCallback(async () => {
    if (!opportunity || !asset || !dispatch || !totalFiatBalance) return
    // set withdraw state for future use
    dispatch({ type: FoxFarmingWithdrawActionType.SET_LOADING, payload: true })
    dispatch({
      type: FoxFarmingWithdrawActionType.SET_WITHDRAW,
      payload: { lpAmount: amountAvailableCryptoPrecision, isExiting: true },
    })
    const lpAllowance = await allowance()
    const allowanceAmount = bn(fromBaseUnit(bnOrZero(lpAllowance), asset?.precision ?? 18))

    // Skip approval step if user allowance is greater than or equal requested deposit amount
    if (allowanceAmount.gte(amountAvailableCryptoPrecision)) {
      const estimatedGasCrypto = await getWithdrawGasEstimate()
      if (!estimatedGasCrypto) {
        dispatch({ type: FoxFarmingWithdrawActionType.SET_LOADING, payload: false })
        return
      }
      dispatch({
        type: FoxFarmingWithdrawActionType.SET_WITHDRAW,
        payload: { estimatedGasCryptoPrecision: estimatedGasCrypto },
      })
      onNext(DefiStep.Confirm)
      dispatch({ type: FoxFarmingWithdrawActionType.SET_LOADING, payload: false })
      trackOpportunityEvent(
        MixPanelEvents.WithdrawContinue,
        {
          opportunity,
          fiatAmounts: [totalFiatBalance],
          cryptoAmounts: [
            {
              assetId: asset?.assetId,
              amountCryptoHuman: amountAvailableCryptoPrecision,
            },
          ],
        },
        assets,
      )
    } else {
      const fees = await getApproveFees()
      if (!fees) return
      dispatch({
        type: FoxFarmingWithdrawActionType.SET_APPROVE,
        payload: {
          estimatedGasCryptoPrecision: fromBaseUnit(
            fees.networkFeeCryptoBaseUnit,
            feeAsset.precision,
          ),
        },
      })
      onNext(DefiStep.Approve)
      dispatch({ type: FoxFarmingWithdrawActionType.SET_LOADING, payload: false })
    }
  }, [
    allowance,
    amountAvailableCryptoPrecision,
    asset,
    assets,
    dispatch,
    feeAsset.precision,
    getApproveFees,
    getWithdrawGasEstimate,
    onNext,
    opportunity,
    totalFiatBalance,
  ])

  const validateCryptoAmount = useCallback(
    (value: string) => {
      const crypto = bnOrZero(amountAvailableCryptoPrecision)
      const _value = bnOrZero(value)
      const hasValidBalance = crypto.gt(0) && _value.gt(0) && crypto.gte(value)
      if (_value.isEqualTo(0)) return ''
      return hasValidBalance || 'common.insufficientFunds'
    },
    [amountAvailableCryptoPrecision],
  )

  const cryptoInputValidation = useMemo(
    () => ({
      required: true,
      validate: { validateCryptoAmount },
    }),
    [validateCryptoAmount],
  )

  const inputDefaultValue = useMemo(
    () => ({
      cryptoAmount: amountAvailableCryptoPrecision,
      fiatAmount: totalFiatBalance ?? '0',
    }),
    [amountAvailableCryptoPrecision, totalFiatBalance],
  )

  const inputChildren = useMemo(
    () => (
      <Stack px={4} py={2}>
        <Text
          fontSize='xs'
          translation='defi.steps.withdraw.info.rewardsInfo'
          color='text.subtle'
        />
        <Stack direction='row'>
          <AssetIcon assetId={rewardAssetId} size='xs' />
          <Amount.Crypto value={rewardAmountCryptoPrecision} symbol={rewardAsset.symbol} />
        </Stack>
      </Stack>
    ),
    [rewardAmountCryptoPrecision, rewardAssetId, rewardAsset.symbol],
  )

  // no-op for expired withdraw
  const handlePercentClick = useCallback(() => {}, [])

  const handleCancel = browserHistory.goBack

  if (!state || !dispatch || !opportunity || !totalFiatBalance || !asset) return null

  return (
    <FormProvider {...methods}>
      <ReusableWithdraw
        accountId={accountId}
        asset={asset}
        disableInput
        icons={opportunity?.icons}
        cryptoAmountAvailable={amountAvailableCryptoPrecision}
        cryptoInputValidation={cryptoInputValidation}
        fiatAmountAvailable={totalFiatBalance}
        marketData={lpMarketData}
        onAccountIdChange={handleAccountIdChange}
        onCancel={handleCancel}
        onContinue={handleContinue}
        isLoading={state.loading}
        percentOptions={percentOptionsEmpty}
        enableSlippage={false}
        handlePercentClick={handlePercentClick}
        inputDefaultValue={inputDefaultValue}
        inputChildren={inputChildren}
      />
    </FormProvider>
  )
}
