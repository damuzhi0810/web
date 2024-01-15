import type { Tx } from '../../../index'

const tx: Tx = {
  txid: '54a990298b6b0c3e3ec9425e3c472ccee85e06552508c2e7622027e7cd838a4c',
  blockHash: '0000000000000000000091c5a281798916835808be23053b1e947459e54f8489',
  blockHeight: 825037,
  timestamp: 1704826002,
  confirmations: 2,
  value: '841681',
  fee: '40128',
  hex: '02000000000102f04d5ade98060a34e86a9dc42025919482b40e764e28b2683f3c1f2d1f553f870000000000ffffffff7e83be97ca70feb50ecd0a3bbb58b2240abf592ca66129b4fc50851728974ddf0000000000ffffffff03f1ed0b0000000000160014407afe0a21bd5fed4aa98da464084dd2e8a29e0d0000000000000000496a473d3a474149412e41544f4d3a636f736d6f73316179776d6c7578616e617765707532673276706533613434396173686c787930346c326d63633a333732303765353a72673a3235e0e9000000000000160014bc8fa8472cc2885775d9c6773580f00bf11d837d02483045022100db52d55d0d536b02b3a6608e3302340c708f2aca314b66a0fa65ae3fecd0542e02205a102be29c87cb29e10be25539c6dc01273b877143e4f6de131c995197d5c4a5012103618338071e5feb2c83a34578dfd36186d3123af9ccca0f4f1073c549046750f402473044022065c0952e8c2ddb5d1cc20f6021f78073c26421017d3945e25df33103e3b8652e02205582013765775d63e8d03c4259f1c10aef5b847a914e0fdf474468212ac094a2012103618338071e5feb2c83a34578dfd36186d3123af9ccca0f4f1073c549046750f400000000',
  vin: [
    {
      txid: '873f551f2d1f3c3f68b2284e760eb48294912520c49d6ae8340a0698de5a4df0',
      sequence: 4294967295,
      addresses: ['bc1qhj86s3evc2y9wawecemntq8sp0c3mqmaagmqjd'],
      value: '161139',
    },
    {
      txid: 'df4d9728178550fcb42961a62c59bf0a24b258bb3b0acd0eb5fe70ca97be837e',
      sequence: 4294967295,
      addresses: ['bc1qhj86s3evc2y9wawecemntq8sp0c3mqmaagmqjd'],
      value: '720670',
    },
  ],
  vout: [
    {
      value: '781809',
      n: 0,
      scriptPubKey: {
        hex: '0014407afe0a21bd5fed4aa98da464084dd2e8a29e0d',
      },
      addresses: ['bc1qgpa0uz3ph4076j4f3kjxgzzd6t5298sdtjvwc9'],
    },
    {
      value: '0',
      n: 1,
      opReturn:
        'OP_RETURN (=:GAIA.ATOM:cosmos1aywmluxanawepu2g2vpe3a449ashlxy04l2mcc:37207e5:rg:25)',
      scriptPubKey: {
        hex: '6a473d3a474149412e41544f4d3a636f736d6f73316179776d6c7578616e617765707532673276706533613434396173686c787930346c326d63633a333732303765353a72673a3235',
      },
    },
    {
      value: '59872',
      n: 2,
      scriptPubKey: {
        hex: '0014bc8fa8472cc2885775d9c6773580f00bf11d837d',
      },
      addresses: ['bc1qhj86s3evc2y9wawecemntq8sp0c3mqmaagmqjd'],
    },
  ],
}

export default { tx }
