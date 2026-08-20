import { useCallback, useEffect, useState } from 'react'
import { getContractClient } from '../lib/contractClient'
import type { SplitRecord } from '../contracts/kitty-split/src'

export function useSplit(splitId: bigint | null) {
  const [split, setSplit] = useState<SplitRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (splitId === null) {
      setSplit(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const client = getContractClient()
      const tx = await client.get_split({ split_id: splitId })
      if (tx.result.isErr()) {
        setError(tx.result.unwrapErr().message)
        setSplit(null)
      } else {
        setSplit(tx.result.unwrap())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load split')
      setSplit(null)
    } finally {
      setLoading(false)
    }
  }, [splitId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { split, loading, error, refresh }
}
