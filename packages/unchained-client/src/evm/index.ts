import * as avalanche from './avalanche'
import * as bnbsmartchain from './bnbsmartchain'
import * as ethereum from './ethereum'
import * as optimism from './optimism'
import * as polygon from './polygon'

export type { evm as types } from '@shapeshiftoss/common-api'

export type Api =
  | ethereum.V1Api
  | avalanche.V1Api
  | optimism.V1Api
  | polygon.V1Api
  | bnbsmartchain.V1Api

export * from './parser'
export { ethereum, avalanche, optimism, polygon, bnbsmartchain }
