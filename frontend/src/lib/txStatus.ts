import type { KittyError } from './errors'

export type TxStatus = 'idle' | 'pending' | 'success' | 'error'

export type TxState<T> = {
  status: TxStatus
  hash: string | null
  result: T | null
  error: KittyError | null
}

export const idleTx = <T>(): TxState<T> => ({
  status: 'idle',
  hash: null,
  result: null,
  error: null,
})
