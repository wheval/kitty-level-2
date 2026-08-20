import { rpc } from '@stellar/stellar-sdk'

export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
export const RPC_URL = 'https://soroban-testnet.stellar.org'
export const HORIZON_URL = 'https://horizon-testnet.stellar.org'

export const CONTRACT_ID = 'CBIOSQCKT53INVR6SF4B5MU7EWH4TH4AMPTD7QXRG6WGWPE3R7JBS5NB'
export const NATIVE_TOKEN_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'

export const server = new rpc.Server(RPC_URL)
