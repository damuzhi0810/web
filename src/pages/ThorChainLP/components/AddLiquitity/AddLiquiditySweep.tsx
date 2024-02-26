import { ArrowBackIcon } from '@chakra-ui/icons'
import { CardBody, CardHeader, Flex, IconButton } from '@chakra-ui/react'
import { fromAssetId } from '@shapeshiftoss/caip'
import React, { useMemo } from 'react'
import { useTranslate } from 'react-polyglot'
import { SlideTransition } from 'components/SlideTransition'
import { Sweep } from 'components/Sweep'
import type { LpConfirmedDepositQuote } from 'lib/utils/thorchain/lp/types'
import { fromOpportunityId } from 'pages/ThorChainLP/utils'

type AddLiquiditySweepProps = {
  confirmedQuote: LpConfirmedDepositQuote
  onBack: () => void
  onSweepSeen: () => void
}

const backIcon = <ArrowBackIcon />

export const AddLiquiditySweep: React.FC<AddLiquiditySweepProps> = ({
  confirmedQuote,
  onBack: handleBack,
  onSweepSeen: handleSweepSeen,
}) => {
  const translate = useTranslate()

  const { opportunityId, accountIdsByChainId, assetAddress } = confirmedQuote

  const assetId = useMemo(() => fromOpportunityId(opportunityId).assetId, [opportunityId])

  const accountId = useMemo(() => {
    return accountIdsByChainId[assetId ? fromAssetId(assetId).chainId : '']
  }, [accountIdsByChainId, assetId])

  if (!assetId || !accountId || !assetAddress) return null

  return (
    <SlideTransition>
      <CardHeader display='flex' alignItems='center' gap={2}>
        <Flex flex={1}>
          <IconButton onClick={handleBack} variant='ghost' aria-label='back' icon={backIcon} />
        </Flex>
        <Flex textAlign='center'>{translate('common.confirm')}</Flex>
        <Flex flex={1}></Flex>
      </CardHeader>
      <CardBody pt={0}>
        <Sweep
          assetId={assetId}
          fromAddress={assetAddress}
          accountId={accountId}
          onBack={handleBack}
          onSweepSeen={handleSweepSeen}
        />
      </CardBody>
    </SlideTransition>
  )
}
