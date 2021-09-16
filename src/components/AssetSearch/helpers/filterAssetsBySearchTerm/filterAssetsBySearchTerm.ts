import { Asset } from '@shapeshiftoss/asset-service'
import { matchSorter } from 'match-sorter'

const isAddress = (address: string) => {
  return /^(0x)?[0-9a-fA-F]{40}$/.test(address)
}

export const filterAssetsBySearchTerm = (
  search: string,
  assets: Pick<Asset, 'tokenId' | 'symbol' | 'name'>[]
) => {
  if (!assets) return []

  const searchLower = search.toLowerCase()

  if (isAddress(search)) {
    return assets.filter(asset => asset?.tokenId?.toLowerCase() === searchLower)
  }

  return matchSorter(assets, search, { keys: ['name', 'symbol'] })
}
