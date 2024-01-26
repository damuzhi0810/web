import type { Tx } from '../../../index'

const tx: Tx = {
  txid: '0x672c5e962e318650ac54064ea60207632a36cdd0b473e0ef26b8f15f08da8151',
  blockHash: '0x50bf5954e1894efc3eace0554410f7776117e3d468735dd98c58e91fa250d116',
  blockHeight: 19074857,
  timestamp: 1706079467,
  status: 1,
  from: '0x782C14C79945caD46Fbea57bb73d796366e76147',
  to: '0xD37BbE5744D730a1d98d8DC97c42F0Ca46aD7146',
  confirmations: 10656,
  value: '5000000000000000',
  fee: '337311847859024',
  gasLimit: '68400',
  gasUsed: '40633',
  gasPrice: '8301426128',
  inputData:
    '0x44bc937b000000000000000000000000610c97879cd08d54721fd6cdfa143887778ad8c100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011c37937e0800000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000065b0b8610000000000000000000000000000000000000000000000000000000000000065242b3a4554482e4441492d3058364231373534373445383930393443343444413938423935344545444541433439353237314430463a3078373832433134433739393435636144343646626561353762623733643739363336366537363134373a3a743a30000000000000000000000000000000000000000000000000000000',
  internalTxs: [
    {
      from: '0xD37BbE5744D730a1d98d8DC97c42F0Ca46aD7146',
      to: '0x610c97879CD08D54721fD6CDfA143887778AD8c1',
      value: '5000000000000000',
    },
  ],
}

export default { tx }
