import { adapters, AssetId, btcAssetId } from '@shapeshiftoss/caip'
import { getConfig } from 'config'
import concat from 'lodash/concat'
import banxaLogo from 'assets/banxa.png'
import gemLogo from 'assets/gem-mark.png'
import junoPayLogo from 'assets/junoPay.svg'
import { logger } from 'lib/logger'

import { createBanxaUrl, getBanxaAssets } from './fiatRampProviders/banxa'
import {
  fetchCoinifySupportedCurrencies,
  fetchWyreSupportedCurrencies,
  makeGemPartnerUrl,
  parseGemBuyAssets,
  parseGemSellAssets,
} from './fiatRampProviders/gem'
import { createJunoPayUrl, getJunoPayAssets } from './fiatRampProviders/junopay'
import { FiatRampAction, FiatRampAsset } from './FiatRampsCommon'

const moduleLogger = logger.child({
  namespace: ['Modals', 'FiatRamps', 'config'],
})

export const usdcAssetId: AssetId = 'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
export const usdtAssetId: AssetId = 'eip155:1/erc20:0xdac17f958d2ee523a2206206994597c13d831ec7'

export interface SupportedFiatRampConfig {
  // key of translation jsons, will be used to show the provider name in the list
  label: string
  // key of translation jsons, will be used to show the provider info in the list
  info?: string
  logo: string
  isImplemented: boolean
  getBuyAndSellList: () => Promise<[FiatRampAsset[], FiatRampAsset[]]>
  onSubmit: (action: FiatRampAction, asset: string, address: string) => void
  minimumSellThreshold?: number
  supportsBuy: boolean
  supportsSell: boolean
}

export type FiatRamp = 'Gem' | 'Banxa' | 'JunoPay'
export type SupportedFiatRamp = Record<FiatRamp, SupportedFiatRampConfig>

export const supportedFiatRamps: SupportedFiatRamp = {
  Gem: {
    label: 'fiatRamps.gem',
    info: 'fiatRamps.gemMessage',
    logo: gemLogo,
    supportsBuy: true,
    supportsSell: true,
    getBuyAndSellList: async () => {
      const coinifyAssets = await fetchCoinifySupportedCurrencies()
      const wyreAssets = await fetchWyreSupportedCurrencies()
      const currencyList = concat(coinifyAssets, wyreAssets)
      const parsedBuyList = parseGemBuyAssets(currencyList)
      const parsedSellList = parseGemSellAssets(currencyList)
      return [parsedBuyList, parsedSellList]
    },
    onSubmit: (action, assetId: AssetId, address) => {
      try {
        const ticker = adapters.assetIdToGemTicker(assetId)
        const gemPartnerUrl = makeGemPartnerUrl(action, ticker, address)
        window.open(gemPartnerUrl, '_blank')?.focus()
      } catch (err) {
        moduleLogger.error(err, { fn: 'Gem onSubmit' }, 'Asset not supported by Gem')
      }
    },
    isImplemented: true,
    minimumSellThreshold: 5,
  },
  Banxa: {
    label: 'fiatRamps.banxa',
    info: 'fiatRamps.banxaMessage',
    logo: banxaLogo,
    isImplemented: true,
    minimumSellThreshold: 50,
    supportsBuy: true,
    supportsSell: true,
    getBuyAndSellList: async () => {
      const buyAssets = getBanxaAssets()
      const sellAssets = buyAssets.filter(a =>
        [btcAssetId, usdcAssetId, usdtAssetId].includes(a.assetId),
      )
      return [buyAssets, sellAssets]
    },
    onSubmit: (action: FiatRampAction, assetId: AssetId, address: string) => {
      try {
        const ticker = adapters.assetIdToBanxaTicker(assetId)
        if (!ticker) throw new Error('Asset not supported by Banxa')
        const banxaCheckoutUrl = createBanxaUrl(action, ticker, address)
        window.open(banxaCheckoutUrl, '_blank')?.focus()
      } catch (err) {
        moduleLogger.error(err, { fn: 'Banxa onSubmit' }, 'Asset not supported by Banxa')
      }
    },
  },
  JunoPay: {
    label: 'fiatRamps.junoPay',
    info: 'fiatRamps.junoPayMessage',
    logo: junoPayLogo,
    isImplemented: getConfig().REACT_APP_FEATURE_JUNOPAY,
    supportsBuy: true,
    supportsSell: false,
    getBuyAndSellList: async () => {
      const buyAssets = await getJunoPayAssets()
      return [buyAssets, []]
    },
    onSubmit: (action: FiatRampAction, assetId: AssetId, address: string) => {
      try {
        const ticker = adapters.assetIdToJunoPayTicker(assetId)
        if (!ticker) throw new Error('Asset not supported by JunoPay')
        const junoPayCheckoutUrl = createJunoPayUrl(action, ticker, address)
        window.open(junoPayCheckoutUrl, '_blank')?.focus()
      } catch (err) {
        moduleLogger.error(err, { fn: 'JunoPay onSubmit' }, 'Asset not supported by JunoPay')
      }
    },
  },
}
