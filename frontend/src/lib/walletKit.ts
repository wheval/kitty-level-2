import {
  StellarWalletsKit,
  FreighterModule,
  xBullModule,
  AlbedoModule,
  LobstrModule,
  RabetModule,
  HanaModule,
  Networks,
} from '@creit.tech/stellar-wallets-kit'

StellarWalletsKit.init({
  network: Networks.TESTNET,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new AlbedoModule(),
    new LobstrModule(),
    new RabetModule(),
    new HanaModule(),
  ],
})

export { StellarWalletsKit }
