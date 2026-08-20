import { useCallback, useState } from 'react'
import { getContractClient } from '../lib/contractClient'
import { classifyError } from '../lib/errors'
import { idleTx, type TxState } from '../lib/txStatus'

export function useCreateSplit(publicKey: string | null) {
  const [state, setState] = useState<TxState<bigint>>(idleTx<bigint>())

  const createSplit = useCallback(
    async (recipients: string[], amounts: bigint[]) => {
      if (!publicKey) {
        setState({
          status: 'error',
          hash: null,
          result: null,
          error: { type: 'wallet_not_found', message: 'Connect a wallet first.' },
        })
        return
      }

      setState({ status: 'pending', hash: null, result: null, error: null })
      try {
        const client = getContractClient(publicKey)
        const tx = await client.create_split({
          creator: publicKey,
          recipients,
          amounts,
        })

        let hash: string | null = null
        const sent = await tx.signAndSend({
          watcher: {
            onSubmitted: (resp) => {
              hash = resp?.hash ?? hash
              setState((s) => ({ ...s, hash }))
            },
          },
        })

        if (sent.result.isErr()) {
          setState({
            status: 'error',
            hash,
            result: null,
            error: { type: 'unknown', message: sent.result.unwrapErr().message },
          })
          return
        }

        setState({
          status: 'success',
          hash,
          result: sent.result.unwrap(),
          error: null,
        })
      } catch (err) {
        setState({ status: 'error', hash: null, result: null, error: classifyError(err) })
      }
    },
    [publicKey],
  )

  const reset = useCallback(() => setState(idleTx<bigint>()), [])

  return { ...state, createSplit, reset }
}
