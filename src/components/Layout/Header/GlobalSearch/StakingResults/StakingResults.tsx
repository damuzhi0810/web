import { List } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslate } from 'react-polyglot'
import type { StakingId } from 'state/slices/opportunitiesSlice/types'

import { ListItemSection } from '../ListItemSection'
import type { GlobalSearchResultsProps } from '../types'
import { StakingResult } from './StakingResult'

export const StakingResults: React.FC<GlobalSearchResultsProps> = ({
  results,
  activeIndex,
  onClick,
  startingIndex,
  searchQuery,
  menuNodes,
}) => {
  const translate = useTranslate()
  const renderRows = useMemo(() => {
    return results.map((result, index) => {
      const { id } = result
      return (
        <StakingResult
          stakingId={id as StakingId}
          index={index + startingIndex}
          key={`staking-${index}`}
          activeIndex={activeIndex}
          onClick={() => onClick(result)}
          ref={menuNodes.ref(index + startingIndex)}
        />
      )
    })
  }, [activeIndex, menuNodes, onClick, results, startingIndex])
  if (searchQuery && !results.length) return null
  return (
    <>
      <ListItemSection title={translate('staking.staking')} />
      <List px={2}>{renderRows}</List>
    </>
  )
}
