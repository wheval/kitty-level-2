import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter'
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull'
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo'
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr'
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet'
import { HanaModule } from '@creit.tech/stellar-wallets-kit/modules/hana'

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
