const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { abi } = require('./abi')

const config = {
  polygon: {
    bucketsFactory: '0x7E6915D307F434E4171cCee90e180f5021c60089',
    positionManager: '0x02bcaA4633E466d151b34112608f60A82a4F6035',
    traderBalanceVault: '0x0801896C67CF024606BcC92bd788d6Eb077CC74F',
    defaultTokens: {
      WETH: ADDRESSES.polygon.WETH_1,
      WBTC: ADDRESSES.polygon.WBTC,
      WMATIC: ADDRESSES.polygon.WMATIC_2,
      USDC: ADDRESSES.polygon.USDC,
      USDT: ADDRESSES.polygon.USDT,
      EPMX: "0xDc6D1bd104E1efa4A1bf0BBCf6E0BD093614E31A"
    },
  },
}

module.exports = {}

Object.keys(config).forEach(chain => {
  const { bucketsFactory, positionManager, traderBalanceVault, defaultTokens } = config[chain]

  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const buckets = await api.call({ target: bucketsFactory, abi: abi.allBuckets })
      const borrowedTokensAddresses = await api.multiCall({ abi: abi.borrowedAsset, calls: buckets })

      const tokensAndOwnersBuckets = buckets.map((b, i) => [borrowedTokensAddresses[i], b])
      const tokensAndOwnersPM = Object.values(defaultTokens).map(t => [t, positionManager])
      const tokensAndOwnersTBV = Object.values(defaultTokens).map(t => [t, traderBalanceVault])

      const tokensAndOwners = tokensAndOwnersBuckets.concat(tokensAndOwnersPM, tokensAndOwnersTBV)

      return sumTokens2({ api, tokensAndOwners })
    }
  }
})

