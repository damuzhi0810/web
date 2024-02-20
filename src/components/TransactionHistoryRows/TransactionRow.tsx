import type { BoxProps } from '@chakra-ui/react'
import { Box, forwardRef, useColorModeValue } from '@chakra-ui/react'
import type { Asset } from '@shapeshiftoss/types'
import { TradeType } from '@shapeshiftoss/unchained-client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useCallback, useMemo, useState } from 'react'
import { TransactionCommon } from 'components/TransactionHistoryRows/TransactionCommon'
import { TransactionMethod } from 'components/TransactionHistoryRows/TransactionMethod'
import { TransactionTrade } from 'components/TransactionHistoryRows/TransactionTrade'
import type { TxDetails } from 'hooks/useTxDetails/useTxDetails'
import { useTxDetails } from 'hooks/useTxDetails/useTxDetails'

dayjs.extend(relativeTime)

export type TransactionRowProps = {
  txDetails: TxDetails
  showDateAndGuide?: boolean
  compactMode: boolean
  isOpen: boolean
  toggleOpen: () => void
  parentWidth: number
}

type TxRowProps = {
  txId: string
  activeAsset?: Asset
  showDateAndGuide?: boolean
  useCompactMode?: boolean
  parentWidth: number
  initOpen?: boolean
  disableCollapse?: boolean
} & BoxProps

const TransactionType = ({
  txDetails,
  showDateAndGuide,
  useCompactMode,
  isOpen,
  parentWidth,
  toggleOpen,
}: {
  txDetails: TxDetails
  showDateAndGuide: boolean
  useCompactMode: boolean
  isOpen: boolean
  parentWidth: number
  toggleOpen: () => void
}): JSX.Element => {
  const props: TransactionRowProps = useMemo(
    () => ({
      txDetails,
      showDateAndGuide,
      compactMode: useCompactMode,
      toggleOpen,
      isOpen,
      parentWidth,
    }),
    [isOpen, parentWidth, showDateAndGuide, toggleOpen, txDetails, useCompactMode],
  )

  switch (txDetails.type) {
    case TradeType.Trade:
    case TradeType.Swap:
    case TradeType.Refund:
      return <TransactionTrade {...props} />
    case 'method':
      return <TransactionMethod {...props} />
    default:
      return <TransactionCommon {...props} />
  }
}

export const TransactionRow = forwardRef<TxRowProps, 'div'>(
  (
    {
      txId,
      showDateAndGuide = false,
      useCompactMode = false,
      parentWidth,
      initOpen = false,
      disableCollapse = false,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(initOpen)
    const toggleOpen = useCallback(
      () => (disableCollapse ? null : setIsOpen(!isOpen)),
      [disableCollapse, isOpen],
    )
    const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
    const txDetails = useTxDetails(txId)

    const backgroundProps = useMemo(() => ({ bg: 'background.surface.hover' }), [])

    return (
      <Box
        width='full'
        rounded='lg'
        _hover={backgroundProps}
        _selected={backgroundProps}
        bg={isOpen ? 'background.surface.hover' : 'transparent'}
        borderColor={isOpen ? borderColor : 'transparent'}
        borderWidth={1}
        ref={ref}
        {...rest}
      >
        <TransactionType
          txDetails={txDetails}
          showDateAndGuide={showDateAndGuide}
          useCompactMode={useCompactMode}
          isOpen={isOpen}
          toggleOpen={toggleOpen}
          parentWidth={parentWidth}
        />
      </Box>
    )
  },
)
