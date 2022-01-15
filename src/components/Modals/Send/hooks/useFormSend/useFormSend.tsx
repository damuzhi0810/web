import { useToast } from '@chakra-ui/react'
import { ChainAdapter, utxoAccountParams } from '@shapeshiftoss/chain-adapters'
import { chainAdapters, ChainTypes, UtxoAccountType } from '@shapeshiftoss/types'
import last from 'lodash/last'
import { useTranslate } from 'react-polyglot'
import { useChainAdapters } from 'context/ChainAdaptersProvider/ChainAdaptersProvider'
import { useModal } from 'context/ModalProvider/ModalProvider'
import { useWallet } from 'context/WalletProvider/WalletProvider'
import { bnOrZero } from 'lib/bignumber/bignumber'

import { SendInput } from '../../Form'

export const useFormSend = () => {
  const toast = useToast()
  const translate = useTranslate()
  const chainAdapterManager = useChainAdapters()
  const { send } = useModal()
  const {
    state: { wallet }
  } = useWallet()

  const handleSend = async (data: SendInput) => {
    if (wallet) {
      try {
        const adapter = chainAdapterManager.byChain(data.asset.chain)
        const value = bnOrZero(data.cryptoAmount)
          .times(bnOrZero(10).exponentiatedBy(data.asset.precision))
          .toFixed(0)

        const adapterType = adapter.getType()

        let result

        const { estimatedFees, feeType, address: to } = data
        if (adapterType === ChainTypes.Ethereum) {
          const fees = estimatedFees[feeType] as chainAdapters.FeeData<ChainTypes.Ethereum>
          const gasPrice = fees.chainSpecific.gasPrice
          const gasLimit = fees.chainSpecific.gasLimit
          result = await (adapter as ChainAdapter<ChainTypes.Ethereum>).buildSendTransaction({
            to,
            value,
            wallet,
            chainSpecific: { erc20ContractAddress: data.asset.tokenId, gasPrice, gasLimit },
            sendMax: data.sendMax
          })
        } else if (adapterType === ChainTypes.Bitcoin) {
          const fees = estimatedFees[feeType] as chainAdapters.FeeData<ChainTypes.Bitcoin>

          let accountType = ''
          const pubkey = last(data.accountId.split(':'))
          if (!pubkey) throw new Error('Did not pass pubkey')
          if (pubkey?.startsWith('xpub')) accountType = UtxoAccountType.P2pkh
          if (pubkey?.startsWith('ypub')) accountType = UtxoAccountType.SegwitP2sh
          if (pubkey?.startsWith('zpub')) accountType = UtxoAccountType.SegwitNative
          if (!accountType) throw new Error('Could not find script type.')

          const utxoParams = utxoAccountParams(data.asset, accountType as UtxoAccountType, 0)

          result = await (adapter as ChainAdapter<ChainTypes.Bitcoin>).buildSendTransaction({
            to,
            value,
            wallet,
            bip44Params: utxoParams.bip44Params,
            chainSpecific: {
              satoshiPerByte: fees.chainSpecific.satoshiPerByte,
              accountType: accountType as UtxoAccountType
            },
            sendMax: data.sendMax
          })
        } else {
          throw new Error('unsupported adapterType')
        }
        const txToSign = result.txToSign

        let broadcastTXID: string | undefined

        if (wallet.supportsOfflineSigning()) {
          const signedTx = await adapter.signTransaction({ txToSign, wallet })
          await adapter.broadcastTransaction(signedTx)
        } else if (wallet.supportsBroadcast()) {
          /**
           * signAndBroadcastTransaction is an optional method on the HDWallet interface.
           * Check and see if it exists; if so, call and make sure a txhash is returned
           */
          if (!adapter.signAndBroadcastTransaction) {
            throw new Error('signAndBroadcastTransaction undefined for wallet')
          }
          broadcastTXID = await adapter.signAndBroadcastTransaction?.({ txToSign, wallet })
          if (!broadcastTXID) {
            throw new Error('Broadcast failed')
          }
        } else {
          throw new Error('Bad hdwallet config')
        }

        toast({
          title: translate('modals.send.sent', { asset: data.asset.name }),
          description: translate('modals.send.youHaveSent', {
            amount: data.cryptoAmount,
            symbol: data.cryptoSymbol
          }),
          status: 'success',
          duration: 9000,
          isClosable: true,
          position: 'top-right'
        })
      } catch (error) {
        toast({
          title: translate('modals.send.sent'),
          description: translate('modals.send.errorTitle'),
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top-right'
        })
      } finally {
        send.close()
      }
    }
  }
  return {
    handleSend
  }
}
