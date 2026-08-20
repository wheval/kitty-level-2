import { Client } from '../contracts/kitty-split/src'
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from './stellar'
import { StellarWalletsKit } from './walletKit'

export function getContractClient(publicKey?: string) {
  return new Client({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction: (xdr, opts) => StellarWalletsKit.signTransaction(xdr, opts),
  })
}
