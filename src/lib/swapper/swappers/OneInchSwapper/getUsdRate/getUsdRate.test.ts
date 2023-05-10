import { Ok } from '@sniptt/monads'
import type { AxiosStatic } from 'axios'

import { FOX } from '../../utils/test-data/assets'
import { oneInchService } from '../utils/oneInchService'
import type { OneInchSwapperDeps } from '../utils/types'
import { getUsdRate } from './getUsdRate'

jest.mock('../utils/oneInchService', () => {
  const axios: AxiosStatic = jest.createMockFromModule('axios')
  axios.create = jest.fn(() => axios)

  return {
    oneInchService: axios.create(),
  }
})

describe('getUsdRate', () => {
  const deps: OneInchSwapperDeps = {
    apiUrl: 'https://api.1inch.io/v5.0',
  }

  it('returns the correct rate', async () => {
    ;(oneInchService.get as jest.Mock<unknown>).mockReturnValue(
      Promise.resolve(
        Ok({
          data: {
            fromToken: {
              symbol: 'USDC',
              name: 'USD Coin',
              address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              decimals: 6,
              logoURI: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
              eip2612: true,
              domainVersion: '2',
              tags: ['tokens', 'PEG:USD'],
            },
            toToken: {
              symbol: 'FOX',
              name: 'FOX',
              decimals: 18,
              address: '0xc770eefad204b5180df6a14ee197d99d808ee52d',
              logoURI: 'https://tokens.1inch.io/0xc770eefad204b5180df6a14ee197d99d808ee52d.png',
              tags: ['tokens'],
            },
            toTokenAmount: '304775163721065276710',
            fromTokenAmount: '10000000',
            estimatedGas: 306779,
          },
        }),
      ),
    )

    const sellAsset = { ...FOX }
    const usdRate = await getUsdRate(deps, sellAsset)
    expect(usdRate.isErr()).toBe(false)
    expect(usdRate.unwrap()).toEqual('0.03281107252279961839')
  })
})
