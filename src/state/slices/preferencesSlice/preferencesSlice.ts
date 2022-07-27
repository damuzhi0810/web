import { createSlice } from '@reduxjs/toolkit'
import { SupportedFiatCurrencies } from '@shapeshiftoss/market-service'
import { getConfig } from 'config'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { simpleLocale } from 'lib/browserLocale'

dayjs.extend(localizedFormat)

export type FeatureFlags = {
  Osmosis: boolean
  MultiCurrency: boolean
  WalletConnectWallet: boolean
  Avalanche: boolean
  Thor: boolean
  CowSwap: boolean
  Pendo: boolean
  Dogecoin: boolean
}

export type Flag = keyof FeatureFlags

export enum CurrencyFormats {
  DotDecimal = 'en-US',
  CommaDecimal = 'fr-FR',
}

export type Preferences = {
  featureFlags: FeatureFlags
  selectedLocale: string
  balanceThreshold: string
  selectedCurrency: SupportedFiatCurrencies
  currencyFormat: CurrencyFormats
}

const initialState: Preferences = {
  featureFlags: {
    Osmosis: getConfig().REACT_APP_FEATURE_OSMOSIS,
    MultiCurrency: getConfig().REACT_APP_FEATURE_MULTI_CURRENCY,
    WalletConnectWallet: getConfig().REACT_APP_FEATURE_WALLETCONNECT_WALLET,
    Avalanche: getConfig().REACT_APP_FEATURE_AVALANCHE,
    Thor: getConfig().REACT_APP_FEATURE_THOR,
    CowSwap: getConfig().REACT_APP_FEATURE_COWSWAP,
    Pendo: getConfig().REACT_APP_FEATURE_PENDO,
    Dogecoin: getConfig().REACT_APP_FEATURE_DOGECOIN,
  },
  selectedLocale: simpleLocale(),
  balanceThreshold: '0',
  selectedCurrency: 'USD',
  currencyFormat: CurrencyFormats.DotDecimal,
}

export const preferences = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    clearFeatureFlags: state => {
      state.featureFlags = initialState.featureFlags
    },
    setFeatureFlag(state, { payload }: { payload: { flag: keyof FeatureFlags; value: boolean } }) {
      state.featureFlags[payload.flag] = payload.value
    },
    setSelectedLocale(state, { payload }: { payload: { locale: string } }) {
      require(`dayjs/locale/${payload.locale}.js`)

      state.selectedLocale = payload.locale
    },
    setSelectedCurrency(state, { payload }: { payload: { currency: SupportedFiatCurrencies } }) {
      state.selectedCurrency = payload.currency
    },
    setBalanceThreshold(state, { payload }: { payload: { threshold: string } }) {
      state.balanceThreshold = payload.threshold
    },
    setCurrencyFormat(state, { payload }: { payload: { currencyFormat: CurrencyFormats } }) {
      state.currencyFormat = payload.currencyFormat
    },
  },
})
