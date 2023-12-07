import { arbitrumNovaChainId } from '@shapeshiftoss/caip'
import type { Asset } from '@shapeshiftoss/types'

import { arbitrumNova } from '../baseAssets'
import * as coingecko from '../coingecko'
import { getRenderedIdenticonBase64 } from '../generateAssetIcon/generateAssetIcon'

export const getAssets = async (): Promise<Asset[]> => {
  const assets = await coingecko.getAssets(arbitrumNovaChainId)
  return [...assets, arbitrumNova].map(asset => ({
    ...asset,
    icon:
      asset.icon ||
      getRenderedIdenticonBase64(asset.assetId, asset.symbol, {
        identiconImage: { size: 128, background: [45, 55, 72, 255] },
        identiconText: { symbolScale: 7, enableShadow: true },
      }),
  }))
}
