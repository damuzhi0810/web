// Snapshotted as this data is actually deterministic

import { DefiProvider, DefiType } from 'features/defi/contexts/DefiManagerProvider/DefiCommon'

import type { OpportunityMetadata, StakingId } from '../../types'

export enum IdleTag {
  BestYield = 'Best Yield',
  JuniorTranche = 'Junior Tranche',
  SeniorTranche = 'Senior Tranche',
}

// If we can get the base metadata from here, all we need to re-slap in is the APY and TVL really
export const BASE_OPPORTUNITIES_BY_ID: Record<
  StakingId,
  Omit<OpportunityMetadata, 'apy' | 'tvl'>
> = {
  'eip155:1/erc20:0x3fe7940616e5bc47b0775a0dccf6237893353bb4': {
    assetId: 'eip155:1/erc20:0x3fe7940616e5bc47b0775a0dccf6237893353bb4',
    id: 'eip155:1/erc20:0x3fe7940616e5bc47b0775a0dccf6237893353bb4',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x3fe7940616e5bc47b0775a0dccf6237893353bb4',
    underlyingAssetIds: ['eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f'],
    rewardAssetIds: [
      'eip155:1/erc20:0xc00e94cb662c3520282e6f5717214004a7f26888',
      'eip155:1/erc20:0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      'eip155:1/erc20:0x875773784af8135ea0ef43b5a374aad105c5d39e',
    ],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'DAI Vault (Best Yield)',
    tags: [IdleTag.BestYield],
  },
  'eip155:1/erc20:0x5274891bec421b39d23760c04a6755ecb444797c': {
    assetId: 'eip155:1/erc20:0x5274891bec421b39d23760c04a6755ecb444797c',
    id: 'eip155:1/erc20:0x5274891bec421b39d23760c04a6755ecb444797c',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x5274891bec421b39d23760c04a6755ecb444797c',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: [
      'eip155:1/erc20:0xc00e94cb662c3520282e6f5717214004a7f26888',
      'eip155:1/erc20:0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      'eip155:1/erc20:0x875773784af8135ea0ef43b5a374aad105c5d39e',
    ],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Best Yield)',
    tags: [IdleTag.BestYield],
  },
  'eip155:1/erc20:0xf34842d05a1c888ca02769a633df37177415c2f8': {
    assetId: 'eip155:1/erc20:0xf34842d05a1c888ca02769a633df37177415c2f8',
    id: 'eip155:1/erc20:0xf34842d05a1c888ca02769a633df37177415c2f8',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xf34842d05a1c888ca02769a633df37177415c2f8',
    underlyingAssetIds: ['eip155:1/erc20:0xdac17f958d2ee523a2206206994597c13d831ec7'],
    rewardAssetIds: [
      'eip155:1/erc20:0xc00e94cb662c3520282e6f5717214004a7f26888',
      'eip155:1/erc20:0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      'eip155:1/erc20:0x875773784af8135ea0ef43b5a374aad105c5d39e',
    ],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDT Vault (Best Yield)',
    tags: [IdleTag.BestYield],
  },
  'eip155:1/erc20:0xf52cdcd458bf455aed77751743180ec4a595fd3f': {
    assetId: 'eip155:1/erc20:0xf52cdcd458bf455aed77751743180ec4a595fd3f',
    id: 'eip155:1/erc20:0xf52cdcd458bf455aed77751743180ec4a595fd3f',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xf52cdcd458bf455aed77751743180ec4a595fd3f',
    underlyingAssetIds: ['eip155:1/erc20:0x57ab1ec28d129707052df4df418d58a2d46d5f51'],
    rewardAssetIds: ['eip155:1/erc20:0x875773784af8135ea0ef43b5a374aad105c5d39e'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'SUSD Vault (Best Yield)',
    tags: [IdleTag.BestYield],
  },
  'eip155:1/erc20:0xc278041fdd8249fe4c1aad1193876857eea3d68c': {
    assetId: 'eip155:1/erc20:0xc278041fdd8249fe4c1aad1193876857eea3d68c',
    id: 'eip155:1/erc20:0xc278041fdd8249fe4c1aad1193876857eea3d68c',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xc278041fdd8249fe4c1aad1193876857eea3d68c',
    underlyingAssetIds: ['eip155:1/erc20:0x0000000000085d4780b73119b644ae5ecd22b376'],
    rewardAssetIds: ['eip155:1/erc20:0x875773784af8135ea0ef43b5a374aad105c5d39e'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'TUSD Vault (Best Yield)',
    tags: [IdleTag.BestYield],
  },
  'eip155:1/erc20:0x8c81121b15197fa0eeaee1dc75533419dcfd3151': {
    assetId: 'eip155:1/erc20:0x8c81121b15197fa0eeaee1dc75533419dcfd3151',
    id: 'eip155:1/erc20:0x8c81121b15197fa0eeaee1dc75533419dcfd3151',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x8c81121b15197fa0eeaee1dc75533419dcfd3151',
    underlyingAssetIds: ['eip155:1/erc20:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'],
    rewardAssetIds: [
      'eip155:1/erc20:0xc00e94cb662c3520282e6f5717214004a7f26888',
      'eip155:1/erc20:0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      'eip155:1/erc20:0x875773784af8135ea0ef43b5a374aad105c5d39e',
    ],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'WBTC Vault (Best Yield)',
    tags: [IdleTag.BestYield],
  },
  'eip155:1/erc20:0xc8e6ca6e96a326dc448307a5fde90a0b21fd7f80': {
    assetId: 'eip155:1/erc20:0xc8e6ca6e96a326dc448307a5fde90a0b21fd7f80',
    id: 'eip155:1/erc20:0xc8e6ca6e96a326dc448307a5fde90a0b21fd7f80',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xc8e6ca6e96a326dc448307a5fde90a0b21fd7f80',
    underlyingAssetIds: ['eip155:1/erc20:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    rewardAssetIds: [
      'eip155:1/erc20:0xc00e94cb662c3520282e6f5717214004a7f26888',
      'eip155:1/erc20:0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      'eip155:1/erc20:0x875773784af8135ea0ef43b5a374aad105c5d39e',
    ],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'WETH Vault (Best Yield)',
    tags: [IdleTag.BestYield],
  },
  'eip155:1/erc20:0x5c960a3dcc01be8a0f49c02a8cebcacf5d07fabe': {
    assetId: 'eip155:1/erc20:0x5c960a3dcc01be8a0f49c02a8cebcacf5d07fabe',
    id: 'eip155:1/erc20:0x5c960a3dcc01be8a0f49c02a8cebcacf5d07fabe',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x5c960a3dcc01be8a0f49c02a8cebcacf5d07fabe',
    underlyingAssetIds: ['eip155:1/erc20:0x03ab458634910aad20ef5f1c8ee96f1d6ac54919'],
    rewardAssetIds: [
      'eip155:1/erc20:0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      'eip155:1/erc20:0x875773784af8135ea0ef43b5a374aad105c5d39e',
    ],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'RAI Vault (Best Yield)',
    tags: [IdleTag.BestYield],
  },
  'eip155:1/erc20:0x15794da4dcf34e674c18bbfaf4a67ff6189690f5': {
    assetId: 'eip155:1/erc20:0x15794da4dcf34e674c18bbfaf4a67ff6189690f5',
    id: 'eip155:1/erc20:0x15794da4dcf34e674c18bbfaf4a67ff6189690f5',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x15794da4dcf34e674c18bbfaf4a67ff6189690f5',
    underlyingAssetIds: ['eip155:1/erc20:0xd632f22692fac7611d2aa1c0d552930d43caed3b'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'Curve FRAX Vault (Convex Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x790e38d85a364dd03f682f5ecdc88f8ff7299908': {
    assetId: 'eip155:1/erc20:0x790e38d85a364dd03f682f5ecdc88f8ff7299908',
    id: 'eip155:1/erc20:0x790e38d85a364dd03f682f5ecdc88f8ff7299908',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x790e38d85a364dd03f682f5ecdc88f8ff7299908',
    underlyingAssetIds: ['eip155:1/erc20:0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'Curve alUSD Vault (Convex Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x158e04225777bbea34d2762b5df9ebd695c158d2': {
    assetId: 'eip155:1/erc20:0x158e04225777bbea34d2762b5df9ebd695c158d2',
    id: 'eip155:1/erc20:0x158e04225777bbea34d2762b5df9ebd695c158d2',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x158e04225777bbea34d2762b5df9ebd695c158d2',
    underlyingAssetIds: ['eip155:1/erc20:0xb9446c4ef5ebe66268da6700d26f96273de3d571'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'Curve 3EUR Vault (Convex Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x060a53bcfdc0452f35ebd2196c6914e0152379a6': {
    assetId: 'eip155:1/erc20:0x060a53bcfdc0452f35ebd2196c6914e0152379a6',
    id: 'eip155:1/erc20:0x060a53bcfdc0452f35ebd2196c6914e0152379a6',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x060a53bcfdc0452f35ebd2196c6914e0152379a6',
    underlyingAssetIds: ['eip155:1/erc20:0x06325440d014e39736583c165c2963ba99faf14e'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'Curve stETH Vault (Convex Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x1e095cbf663491f15cc1bdb5919e701b27dde90c': {
    assetId: 'eip155:1/erc20:0x1e095cbf663491f15cc1bdb5919e701b27dde90c',
    id: 'eip155:1/erc20:0x1e095cbf663491f15cc1bdb5919e701b27dde90c',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x1e095cbf663491f15cc1bdb5919e701b27dde90c',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Euler Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0xe0f126236d2a5b13f26e72cbb1d1ff5f297dda07': {
    assetId: 'eip155:1/erc20:0xe0f126236d2a5b13f26e72cbb1d1ff5f297dda07',
    id: 'eip155:1/erc20:0xe0f126236d2a5b13f26e72cbb1d1ff5f297dda07',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xe0f126236d2a5b13f26e72cbb1d1ff5f297dda07',
    underlyingAssetIds: ['eip155:1/erc20:0xdac17f958d2ee523a2206206994597c13d831ec7'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDT Vault (Euler Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x852c4d2823e98930388b5ce1ed106310b942bd5a': {
    assetId: 'eip155:1/erc20:0x852c4d2823e98930388b5ce1ed106310b942bd5a',
    id: 'eip155:1/erc20:0x852c4d2823e98930388b5ce1ed106310b942bd5a',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x852c4d2823e98930388b5ce1ed106310b942bd5a',
    underlyingAssetIds: ['eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'DAI Vault (Euler Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x624dfe05202b66d871b8b7c0e14ab29fc3a5120c': {
    assetId: 'eip155:1/erc20:0x624dfe05202b66d871b8b7c0e14ab29fc3a5120c',
    id: 'eip155:1/erc20:0x624dfe05202b66d871b8b7c0e14ab29fc3a5120c',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x624dfe05202b66d871b8b7c0e14ab29fc3a5120c',
    underlyingAssetIds: ['eip155:1/erc20:0x1a7e4e63778b4f12a199c062f3efdd288afcbce8'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'AGEUR Vault (Euler Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0xb86264c21418aa75f7c337b1821ccb4ff4d57673': {
    assetId: 'eip155:1/erc20:0xb86264c21418aa75f7c337b1821ccb4ff4d57673',
    id: 'eip155:1/erc20:0xb86264c21418aa75f7c337b1821ccb4ff4d57673',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xb86264c21418aa75f7c337b1821ccb4ff4d57673',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: ['eip155:1/erc20:0x66761fa41377003622aee3c7675fc7b5c1c2fac5'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Clearpool Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0xa0154a44c1c45bd007743fa622fd0da4f6d67d57': {
    assetId: 'eip155:1/erc20:0xa0154a44c1c45bd007743fa622fd0da4f6d67d57',
    id: 'eip155:1/erc20:0xa0154a44c1c45bd007743fa622fd0da4f6d67d57',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xa0154a44c1c45bd007743fa622fd0da4f6d67d57',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: ['eip155:1/erc20:0x66761fa41377003622aee3c7675fc7b5c1c2fac5'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Clearpool Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x1692f6574a6758adfbd12544e209146dd4510bd7': {
    assetId: 'eip155:1/erc20:0x1692f6574a6758adfbd12544e209146dd4510bd7',
    id: 'eip155:1/erc20:0x1692f6574a6758adfbd12544e209146dd4510bd7',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x1692f6574a6758adfbd12544e209146dd4510bd7',
    underlyingAssetIds: ['eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f'],
    rewardAssetIds: ['eip155:1/erc20:0x66761fa41377003622aee3c7675fc7b5c1c2fac5'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'DAI Vault (Clearpool Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0xd54e5c263298e60a5030ce2c8aca7981eaaaed4a': {
    assetId: 'eip155:1/erc20:0xd54e5c263298e60a5030ce2c8aca7981eaaaed4a',
    id: 'eip155:1/erc20:0xd54e5c263298e60a5030ce2c8aca7981eaaaed4a',
    provider: DefiProvider.Idle,

    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xd54e5c263298e60a5030ce2c8aca7981eaaaed4a',
    underlyingAssetIds: ['eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f'],
    rewardAssetIds: ['eip155:1/erc20:0x6123b0049f904d730db3c36a31167d9d4121fa6b'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'DAI Vault (Ribbon Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x5f45a578491a23ac5aee218e2d405347a0fafa8e': {
    assetId: 'eip155:1/erc20:0x5f45a578491a23ac5aee218e2d405347a0fafa8e',
    id: 'eip155:1/erc20:0x5f45a578491a23ac5aee218e2d405347a0fafa8e',
    provider: DefiProvider.Idle,

    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x5f45a578491a23ac5aee218e2d405347a0fafa8e',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: ['eip155:1/erc20:0x6123b0049f904d730db3c36a31167d9d4121fa6b'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Ribbon Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x3e041c9980bc03011cc30491d0c4ccd53602f89b': {
    assetId: 'eip155:1/erc20:0x3e041c9980bc03011cc30491d0c4ccd53602f89b',
    id: 'eip155:1/erc20:0x3e041c9980bc03011cc30491d0c4ccd53602f89b',
    provider: DefiProvider.Idle,

    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x3e041c9980bc03011cc30491d0c4ccd53602f89b',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: ['eip155:1/erc20:0x6123b0049f904d730db3c36a31167d9d4121fa6b'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Ribbon Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x18cf59480d8c16856701f66028444546b7041307': {
    assetId: 'eip155:1/erc20:0x18cf59480d8c16856701f66028444546b7041307',
    id: 'eip155:1/erc20:0x18cf59480d8c16856701f66028444546b7041307',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x18cf59480d8c16856701f66028444546b7041307',
    underlyingAssetIds: ['eip155:1/erc20:0xd632f22692fac7611d2aa1c0d552930d43caed3b'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'Curve FRAX Vault (Convex Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0xa0e8c9088afb3fa0f40ecdf8b551071c34aa1aa4': {
    assetId: 'eip155:1/erc20:0xa0e8c9088afb3fa0f40ecdf8b551071c34aa1aa4',
    id: 'eip155:1/erc20:0xa0e8c9088afb3fa0f40ecdf8b551071c34aa1aa4',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xa0e8c9088afb3fa0f40ecdf8b551071c34aa1aa4',
    underlyingAssetIds: ['eip155:1/erc20:0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'Curve alUSD Vault (Convex Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0x3061c652b49ae901bbecf622624cc9f633d01bbd': {
    assetId: 'eip155:1/erc20:0x3061c652b49ae901bbecf622624cc9f633d01bbd',
    id: 'eip155:1/erc20:0x3061c652b49ae901bbecf622624cc9f633d01bbd',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x3061c652b49ae901bbecf622624cc9f633d01bbd',
    underlyingAssetIds: ['eip155:1/erc20:0xb9446c4ef5ebe66268da6700d26f96273de3d571'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'Curve 3EUR Vault (Convex Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0xd83246d2bcbc00e85e248a6e9aa35d0a1548968e': {
    assetId: 'eip155:1/erc20:0xd83246d2bcbc00e85e248a6e9aa35d0a1548968e',
    id: 'eip155:1/erc20:0xd83246d2bcbc00e85e248a6e9aa35d0a1548968e',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xd83246d2bcbc00e85e248a6e9aa35d0a1548968e',
    underlyingAssetIds: ['eip155:1/erc20:0x06325440d014e39736583c165c2963ba99faf14e'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'Curve stETH Vault (Convex Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0xe11679cdb4587fee907d69e9ec4a7d3f0c2bcf3b': {
    assetId: 'eip155:1/erc20:0xe11679cdb4587fee907d69e9ec4a7d3f0c2bcf3b',
    id: 'eip155:1/erc20:0xe11679cdb4587fee907d69e9ec4a7d3f0c2bcf3b',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xe11679cdb4587fee907d69e9ec4a7d3f0c2bcf3b',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Euler Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0xb1ec065abf6783bcce003b8d6b9f947129504854': {
    assetId: 'eip155:1/erc20:0xb1ec065abf6783bcce003b8d6b9f947129504854',
    id: 'eip155:1/erc20:0xb1ec065abf6783bcce003b8d6b9f947129504854',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xb1ec065abf6783bcce003b8d6b9f947129504854',
    underlyingAssetIds: ['eip155:1/erc20:0xdac17f958d2ee523a2206206994597c13d831ec7'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDT Vault (Euler Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0x6629baa8c7c6a84290bf9a885825e3540875219d': {
    assetId: 'eip155:1/erc20:0x6629baa8c7c6a84290bf9a885825e3540875219d',
    id: 'eip155:1/erc20:0x6629baa8c7c6a84290bf9a885825e3540875219d',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x6629baa8c7c6a84290bf9a885825e3540875219d',
    underlyingAssetIds: ['eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'DAI Vault (Euler Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0xcf5fd05f72ca777d71fb3e38f296aad7ce735cb7': {
    assetId: 'eip155:1/erc20:0xcf5fd05f72ca777d71fb3e38f296aad7ce735cb7',
    id: 'eip155:1/erc20:0xcf5fd05f72ca777d71fb3e38f296aad7ce735cb7',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xcf5fd05f72ca777d71fb3e38f296aad7ce735cb7',
    underlyingAssetIds: ['eip155:1/erc20:0x1a7e4e63778b4f12a199c062f3efdd288afcbce8'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'AGEUR Vault (Euler Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0x4d9d9aa17c3fcea05f20a87fc1991a045561167d': {
    assetId: 'eip155:1/erc20:0x4d9d9aa17c3fcea05f20a87fc1991a045561167d',
    id: 'eip155:1/erc20:0x4d9d9aa17c3fcea05f20a87fc1991a045561167d',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x4d9d9aa17c3fcea05f20a87fc1991a045561167d',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: ['eip155:1/erc20:0x66761fa41377003622aee3c7675fc7b5c1c2fac5'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Clearpool Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0x7a625a2882c9fc8df1463d5e538a3f39b5dbd073': {
    assetId: 'eip155:1/erc20:0x7a625a2882c9fc8df1463d5e538a3f39b5dbd073',
    id: 'eip155:1/erc20:0x7a625a2882c9fc8df1463d5e538a3f39b5dbd073',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x7a625a2882c9fc8df1463d5e538a3f39b5dbd073',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: ['eip155:1/erc20:0x66761fa41377003622aee3c7675fc7b5c1c2fac5'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Clearpool Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0xcb980b5a4f5bdb81d0b4b97a9ede64578ba9d48a': {
    assetId: 'eip155:1/erc20:0xcb980b5a4f5bdb81d0b4b97a9ede64578ba9d48a',
    id: 'eip155:1/erc20:0xcb980b5a4f5bdb81d0b4b97a9ede64578ba9d48a',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xcb980b5a4f5bdb81d0b4b97a9ede64578ba9d48a',
    underlyingAssetIds: ['eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f'],
    rewardAssetIds: ['eip155:1/erc20:0x66761fa41377003622aee3c7675fc7b5c1c2fac5'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'DAI Vault (Clearpool Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0xd3e4c5c37ba3185410550b836557b8fa51d5ea3b': {
    assetId: 'eip155:1/erc20:0xd3e4c5c37ba3185410550b836557b8fa51d5ea3b',
    id: 'eip155:1/erc20:0xd3e4c5c37ba3185410550b836557b8fa51d5ea3b',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0xd3e4c5c37ba3185410550b836557b8fa51d5ea3b',
    underlyingAssetIds: ['eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f'],
    rewardAssetIds: ['eip155:1/erc20:0x6123b0049f904d730db3c36a31167d9d4121fa6b'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'DAI Vault (Ribbon Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0x982e46e81e99fbba3fb8af031a7ee8df9041bb0c': {
    assetId: 'eip155:1/erc20:0x982e46e81e99fbba3fb8af031a7ee8df9041bb0c',
    id: 'eip155:1/erc20:0x982e46e81e99fbba3fb8af031a7ee8df9041bb0c',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x982e46e81e99fbba3fb8af031a7ee8df9041bb0c',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: ['eip155:1/erc20:0x6123b0049f904d730db3c36a31167d9d4121fa6b'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Ribbon Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0x65237b6fc6e62b05b62f1ebe53edaadccd1684ad': {
    assetId: 'eip155:1/erc20:0x65237b6fc6e62b05b62f1ebe53edaadccd1684ad',
    id: 'eip155:1/erc20:0x65237b6fc6e62b05b62f1ebe53edaadccd1684ad',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x65237b6fc6e62b05b62f1ebe53edaadccd1684ad',
    underlyingAssetIds: ['eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    rewardAssetIds: ['eip155:1/erc20:0x6123b0049f904d730db3c36a31167d9d4121fa6b'],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'USDC Vault (Ribbon Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0x2688fc68c4eac90d9e5e1b94776cf14eade8d877': {
    assetId: 'eip155:1/erc20:0x2688fc68c4eac90d9e5e1b94776cf14eade8d877',
    id: 'eip155:1/erc20:0x2688fc68c4eac90d9e5e1b94776cf14eade8d877',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x2688fc68c4eac90d9e5e1b94776cf14eade8d877',
    underlyingAssetIds: ['eip155:1/erc20:0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'STETH Vault (Lido Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x4657b96d587c4d46666c244b40216beeea437d0d': {
    assetId: 'eip155:1/erc20:0x4657b96d587c4d46666c244b40216beeea437d0d',
    id: 'eip155:1/erc20:0x4657b96d587c4d46666c244b40216beeea437d0d',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x4657b96d587c4d46666c244b40216beeea437d0d',
    underlyingAssetIds: ['eip155:1/erc20:0xc9467e453620f16b57a34a770c6bcebece002587'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'PBTCCRV Vault (Convex Senior Tranche)',
    tags: [IdleTag.SeniorTranche],
  },
  'eip155:1/erc20:0x3a52fa30c33caf05faee0f9c5dfe5fd5fe8b3978': {
    assetId: 'eip155:1/erc20:0x3a52fa30c33caf05faee0f9c5dfe5fd5fe8b3978',
    id: 'eip155:1/erc20:0x3a52fa30c33caf05faee0f9c5dfe5fd5fe8b3978',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x3a52fa30c33caf05faee0f9c5dfe5fd5fe8b3978',
    underlyingAssetIds: ['eip155:1/erc20:0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'STETH Vault (Lido Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
  'eip155:1/erc20:0x3872418402d1e967889ac609731fc9e11f438de5': {
    assetId: 'eip155:1/erc20:0x3872418402d1e967889ac609731fc9e11f438de5',
    id: 'eip155:1/erc20:0x3872418402d1e967889ac609731fc9e11f438de5',
    provider: DefiProvider.Idle,
    type: DefiType.Staking,
    underlyingAssetId: 'eip155:1/erc20:0x3872418402d1e967889ac609731fc9e11f438de5',
    underlyingAssetIds: ['eip155:1/erc20:0xc9467e453620f16b57a34a770c6bcebece002587'],
    rewardAssetIds: [],
    underlyingAssetRatiosBaseUnit: ['1000000000000000000'],
    name: 'PBTCCRV Vault (Convex Junior Tranche)',
    tags: [IdleTag.JuniorTranche],
  },
}
