import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons'
import { Button, Flex, IconButton, Stack } from '@chakra-ui/react'
import type { AccountId, AssetId } from '@shapeshiftoss/caip'
import { ethAssetId, isNft } from '@shapeshiftoss/caip'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaCreditCard } from 'react-icons/fa'
import { useTranslate } from 'react-polyglot'
import { useHistory } from 'react-router-dom'
import { SwapIcon } from 'components/Icons/SwapIcon'
import { FiatRampAction } from 'components/Modals/FiatRamps/FiatRampsCommon'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { WalletActions } from 'context/WalletProvider/actions'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { selectSupportsFiatRampByAssetId } from 'state/apis/fiatRamps/selectors'
import { selectAssetById } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

const IconButtonAfter = {
  content: 'attr(aria-label)',
  position: 'absolute',
  bottom: '-1.5rem',
  fontSize: '12px',
  overflow: 'hidden',
  width: '100%',
  textOverflow: 'ellipsis',
  color: 'text.base',
}

const ButtonRowDisplay = { base: 'flex', md: 'none' }

type AssetActionProps = {
  assetId: AssetId
  accountId?: AccountId
  cryptoBalance: string
  isMobile?: boolean
}

export const AssetActions: React.FC<AssetActionProps> = ({
  assetId,
  accountId,
  cryptoBalance,
  isMobile,
}) => {
  const history = useHistory()

  const [isValidChainId, setIsValidChainId] = useState(true)
  const chainAdapterManager = getChainAdapterManager()
  const send = useModal('send')
  const receive = useModal('receive')
  const fiatRamps = useModal('fiatRamps')
  const translate = useTranslate()
  const {
    state: { isConnected },
    dispatch,
  } = useWallet()
  const asset = useAppSelector(state => selectAssetById(state, assetId))
  if (!asset) throw new Error(`Asset not found for AssetId ${assetId}`)
  const filter = useMemo(() => ({ assetId }), [assetId])
  const assetSupportsBuy = useAppSelector(s => selectSupportsFiatRampByAssetId(s, filter))

  useEffect(() => {
    const isValid = chainAdapterManager.has(asset.chainId)
    setIsValidChainId(isValid)
  }, [chainAdapterManager, asset])

  const handleWalletModalOpen = () =>
    dispatch({ type: WalletActions.SET_WALLET_MODAL, payload: true })
  const handleSendClick = () =>
    isConnected ? send.open({ assetId, accountId }) : handleWalletModalOpen()
  const handleReceiveClick = () =>
    isConnected ? receive.open({ asset, accountId }) : handleWalletModalOpen()
  const hasValidBalance = bnOrZero(cryptoBalance).gt(0)

  const handleBuySellClick = useCallback(() => {
    fiatRamps.open({
      assetId: assetSupportsBuy ? assetId : ethAssetId,
      fiatRampAction: FiatRampAction.Buy,
      accountId,
    })
  }, [accountId, assetId, assetSupportsBuy, fiatRamps])

  const handleTradeClick = useCallback(() => {
    history.push(`/trade/${assetId}`)
  }, [assetId, history])

  if (isMobile) {
    return (
      <Flex width='full' display={ButtonRowDisplay}>
        {isValidChainId && (
          <Flex flex={1} alignItems='center' justifyContent='center' mb={6}>
            <IconButton
              icon={<ArrowUpIcon />}
              size='lg'
              isRound
              aria-label={translate('common.send')}
              _after={IconButtonAfter}
              onClick={handleSendClick}
              isDisabled={!hasValidBalance || !isValidChainId || isNft(assetId)}
              colorScheme='blue'
            />
          </Flex>
        )}

        <Flex flex={1} alignItems='center' justifyContent='center' mb={6}>
          <IconButton
            icon={<ArrowDownIcon />}
            size='lg'
            isRound
            aria-label={translate('common.receive')}
            _after={IconButtonAfter}
            onClick={handleReceiveClick}
            isDisabled={!isValidChainId}
            colorScheme='blue'
          />
        </Flex>
        <Flex flex={1} alignItems='center' justifyContent='center' mb={6}>
          <IconButton
            icon={<SwapIcon />}
            size='lg'
            isRound
            aria-label={translate('navBar.tradeShort')}
            _after={IconButtonAfter}
            onClick={handleTradeClick}
            colorScheme='blue'
          />
        </Flex>
        {assetSupportsBuy && (
          <Flex flex={1} alignItems='center' justifyContent='center' mb={6}>
            <IconButton
              icon={<FaCreditCard />}
              size='lg'
              isRound
              aria-label={translate('navBar.buyCryptoShort')}
              _after={IconButtonAfter}
              onClick={handleBuySellClick}
              isDisabled={!isConnected}
              colorScheme='blue'
            />
          </Flex>
        )}
      </Flex>
    )
  }

  return (
    <Stack
      ml={{ base: 0, lg: 'auto' }}
      mt={{ base: 6, lg: 0 }}
      direction={{ base: 'column-reverse', md: 'row' }}
      justifyContent='flex-end'
      width={{ base: 'full', md: 'auto' }}
      flex={1}
    >
      <Flex direction='row' gap={2} flexWrap='wrap'>
        {isValidChainId && (
          <Button
            data-test='asset-action-trade'
            flex={{ base: 1, md: 'auto' }}
            leftIcon={<SwapIcon />}
            size='sm-multiline'
            width={{ base: '100%', md: 'auto' }}
            onClick={handleTradeClick}
          >
            {translate('assets.assetCards.assetActions.trade')}
          </Button>
        )}

        {assetSupportsBuy && (
          <Button
            data-test='asset-action-buy-sell'
            width={{ base: 'full', md: 'auto' }}
            flex={{ base: 1, md: 'auto' }}
            onClick={handleBuySellClick}
            leftIcon={<FaCreditCard />}
            size='sm-multiline'
          >
            {translate('common.buySell')}
          </Button>
        )}
      </Flex>
      <Flex direction='row' gap={2} flexWrap='wrap'>
        <Button
          onClick={handleSendClick}
          leftIcon={<ArrowUpIcon />}
          width={{ base: '100%', md: 'auto' }}
          isDisabled={!hasValidBalance || !isValidChainId || isNft(assetId)}
          data-test='asset-action-send'
          flex={{ base: 1, md: 'auto' }}
        >
          {translate('common.send')}
        </Button>
        <Button
          disabled={!isValidChainId}
          onClick={handleReceiveClick}
          leftIcon={<ArrowDownIcon />}
          width={{ base: '100%', md: 'auto' }}
          data-test='asset-action-receive'
          flex={{ base: 1, md: 'auto' }}
        >
          {translate('common.receive')}
        </Button>
      </Flex>
    </Stack>
  )
}
