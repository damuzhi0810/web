import type { Tx } from '../../../index'
import { mempoolMock } from './mempoolMock'

const bep1155: Tx = {
  txid: '0x2b63ef5aaf9292023be8936646de66bc389c1c984928a79c93a632e391e8c00e',
  blockHash: '0x3e0a62ba74234949370c2f7d85c15397fb2c61e34de6375227de9dff162e9e48',
  blockHeight: 28094651,
  timestamp: 1683741345,
  status: 1,
  from: '0x606a712666DD5EeF29d2F0360874C8ED1E72A007',
  to: '0xE4395bD1Dae0687dcF6BfBaFdaa8edB5a2065Eef',
  confirmations: 169,
  value: '0',
  fee: '209277000000000',
  gasLimit: '131190',
  gasUsed: '69759',
  gasPrice: '3000000000',
  inputData:
    '0xf242432a000000000000000000000000606a712666dd5eef29d2f0360874c8ed1e72a007000000000000000000000000d3106b990148cfed6d36eac4e2066b9356db423b0000000000000000000000000000000000000000000000000000000000000226000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000360c6ebe',
  tokenTransfers: [
    {
      contract: '0xE4395bD1Dae0687dcF6BfBaFdaa8edB5a2065Eef',
      decimals: 18,
      name: 'Nfterrium Nomad',
      symbol: 'NTMN',
      type: 'BEP1155',
      from: '0x606a712666DD5EeF29d2F0360874C8ED1E72A007',
      to: '0xD3106B990148CFED6D36eaC4E2066B9356dB423b',
      value: '1',
      id: '550',
    },
  ],
  internalTxs: [],
}

export default {
  tx: bep1155,
  txMempool: mempoolMock(bep1155),
}