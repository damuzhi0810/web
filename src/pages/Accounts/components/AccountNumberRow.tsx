import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons'
import type { ButtonProps } from '@chakra-ui/react'
import {
  Avatar,
  Button,
  Collapse,
  Flex,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import type { AccountId, ChainId } from '@shapeshiftoss/caip'
import { useMemo } from 'react'
import { MdOutlineMoreVert } from 'react-icons/md'
import { RiWindow2Line } from 'react-icons/ri'
import { useTranslate } from 'react-polyglot'
import { useSelector } from 'react-redux'
import { Amount } from 'components/Amount/Amount'
import { NestedList } from 'components/NestedList'
import { RawText } from 'components/Text'
import { getAccountTitle } from 'lib/utils'
import { isUtxoAccountId, isUtxoChainId } from 'state/slices/portfolioSlice/utils'
import {
  selectAssets,
  selectFeeAssetByChainId,
  selectPortfolioAccountBalanceByAccountNumberAndChainId,
  selectPortfolioAccountsUserCurrencyBalancesIncludingStaking,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { AccountEntryRow } from './AccountEntryRow'

type AccountNumberRowProps = {
  accountNumber: number
  accountIds: AccountId[]
  chainId: ChainId
} & ButtonProps

type UtxoAccountEntriesProps = {
  accountIds: AccountId[]
  chainId: ChainId
}

const mdOutlineMoreVertIcon = <MdOutlineMoreVert />
const riWindow2LineIcon = <RiWindow2Line />
const arrowDownIcon = <ArrowDownIcon />
const arrowUpIcon = <ArrowUpIcon />

const UtxoAccountEntries: React.FC<UtxoAccountEntriesProps> = ({ accountIds, chainId }) => {
  const feeAsset = useAppSelector(s => selectFeeAssetByChainId(s, chainId))
  const assetId = feeAsset?.assetId

  return useMemo(
    () =>
      assetId ? (
        <>
          {accountIds.map(accountId => (
            <AccountEntryRow
              key={`${assetId}-${accountId}`}
              accountId={accountId}
              assetId={assetId}
            />
          ))}
        </>
      ) : null,
    [accountIds, assetId],
  )
}

type AccountBasedChainEntriesProps = {
  accountId: AccountId
}
const AccountBasedChainEntries: React.FC<AccountBasedChainEntriesProps> = ({ accountId }) => {
  const accountAssetBalancesSortedUserCurrency = useSelector(
    selectPortfolioAccountsUserCurrencyBalancesIncludingStaking,
  )
  const assetIds = useMemo(
    () => Object.keys(accountAssetBalancesSortedUserCurrency[accountId] ?? {}),
    [accountAssetBalancesSortedUserCurrency, accountId],
  )
  return useMemo(
    () => (
      <>
        {assetIds.map(assetId => (
          <AccountEntryRow key={assetId} accountId={accountId} assetId={assetId} />
        ))}
      </>
    ),
    [accountId, assetIds],
  )
}

const accountNumberRowButtonFontSizeProps = { base: 'sm', md: 'md' }
export const AccountNumberRow: React.FC<AccountNumberRowProps> = ({
  accountIds,
  accountNumber,
  chainId,
  ...buttonProps
}) => {
  const { isOpen, onToggle } = useDisclosure()
  const translate = useTranslate()
  const assets = useSelector(selectAssets)
  const accountId = useMemo(() => accountIds[0], [accountIds]) // all accountIds belong to the same chain
  const isUtxoAccount = useMemo(() => isUtxoAccountId(accountId), [accountId])
  const filter = useMemo(() => ({ accountNumber, chainId }), [accountNumber, chainId])
  const fiatBalance = useAppSelector(s =>
    selectPortfolioAccountBalanceByAccountNumberAndChainId(s, filter),
  )
  const feeAsset = useAppSelector(s => selectFeeAssetByChainId(s, chainId))
  const color = feeAsset?.networkColor ?? feeAsset?.color ?? ''
  const accountNumberRowLeftIcon = useMemo(
    // space in string interpolation is not a bug - see Chakra UI Avatar docs
    () => <Avatar bg={`${color}20`} color={color} size='sm' name={`# ${accountNumber}`} />,
    [accountNumber, color],
  )

  /**
   * for UTXO chains, we want to display accounts aggregated by accountNumber first,
   * then script type second, e.g. bitcoin Account #0, then Legacy/Segwit/Segwit Native
   * i.e. there can be multiple accounts per accountNumber
   *
   * for account-based chains, there can only be one account per accountNumber
   * so we aggregate by account, then assets belonging to that account
   */
  const accountEntries = useMemo(
    () =>
      isUtxoAccount ? (
        <UtxoAccountEntries chainId={chainId} accountIds={accountIds} />
      ) : (
        <AccountBasedChainEntries accountId={accountIds[0]} />
      ),
    [accountIds, chainId, isUtxoAccount],
  )

  const title = useMemo(() => {
    return getAccountTitle(accountId, assets)
  }, [assets, accountId])

  const fontFamily = useMemo(() => (!isUtxoChainId(chainId) ? 'monospace' : ''), [chainId])

  return (
    <ListItem>
      <Flex p={0} flexDir='row' display='flex' gap={2} alignItems='center'>
        <Button
          variant='ghost'
          py={4}
          flex={1}
          height='auto'
          iconSpacing={4}
          data-test='account-row-button'
          fontSize={accountNumberRowButtonFontSizeProps}
          leftIcon={accountNumberRowLeftIcon}
          {...buttonProps}
          onClick={onToggle}
        >
          <Stack alignItems='flex-start' spacing={0}>
            <RawText color='var(--chakra-colors-chakra-body-text)' fontFamily={fontFamily}>
              {title}
            </RawText>
            <RawText fontSize='sm' color='text.subtle'>
              {translate('accounts.accountNumber', { accountNumber })}
            </RawText>
          </Stack>
          <Stack direction='row' alignItems='center' spacing={6} ml='auto'>
            <Amount.Fiat value={fiatBalance} />
          </Stack>
        </Button>
        {buttonProps.onClick && (
          <Menu>
            <MenuButton
              as={IconButton}
              size='sm'
              variant='ghost'
              aria-label={translate('accounts.expandAccount')}
              icon={mdOutlineMoreVertIcon}
            />
            <MenuList>
              <MenuGroup
                title={translate('accounts.accountNumber', { accountNumber })}
                color='text.subtle'
              >
                <MenuItem
                  icon={riWindow2LineIcon}
                  onClick={buttonProps.onClick && buttonProps.onClick}
                >
                  {translate('accounts.viewAccount')}
                </MenuItem>
                <MenuItem onClick={onToggle} icon={isOpen ? arrowUpIcon : arrowDownIcon}>
                  {translate(isOpen ? 'accounts.hideAssets' : 'accounts.showAssets')}
                </MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
        )}
      </Flex>
      <NestedList as={Collapse} in={isOpen} pr={0}>
        <ListItem>{accountEntries}</ListItem>
      </NestedList>
    </ListItem>
  )
}
