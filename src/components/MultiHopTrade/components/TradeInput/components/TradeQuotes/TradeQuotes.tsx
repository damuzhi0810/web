import { Collapse, Flex } from '@chakra-ui/react'
import { memo, useMemo } from 'react'
import type { ApiQuote } from 'state/apis/swappers'
import { selectActiveQuoteIndex } from 'state/slices/tradeQuoteSlice/selectors'
import { useAppSelector } from 'state/store'

import { TradeQuote } from './TradeQuote'

type TradeQuotesProps = {
  isOpen?: boolean
  sortedQuotes: ApiQuote[]
}

export const TradeQuotes: React.FC<TradeQuotesProps> = memo(({ isOpen, sortedQuotes }) => {
  const activeQuoteIndex = useAppSelector(selectActiveQuoteIndex)

  const bestQuoteData = sortedQuotes[0]

  const quotes = useMemo(
    () =>
      sortedQuotes.map((quoteData, i) => {
        const { index } = quoteData

        // TODO(woodenfurniture): use quote ID when we want to support multiple quotes per swapper
        const isActive = activeQuoteIndex === index

        return (
          <TradeQuote
            isActive={isActive}
            isBest={i === 0}
            key={index}
            quoteData={quoteData}
            bestInputOutputRatio={bestQuoteData.inputOutputRatio}
          />
        )
      }),
    [activeQuoteIndex, bestQuoteData, sortedQuotes],
  )

  return (
    <Collapse in={isOpen}>
      <Flex flexDir='column' gap={2} width='full' px={4} py={2}>
        {quotes}
      </Flex>
    </Collapse>
  )
})
