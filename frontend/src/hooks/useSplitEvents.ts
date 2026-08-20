import { useEffect, useState } from 'react'
import { scValToNative } from '@stellar/stellar-sdk'
import { server, CONTRACT_ID } from '../lib/stellar'

export type PaidEvent = {
  id: string
  splitId: bigint
  payer: string
  amount: bigint
  ledger: number
  txHash: string
}

const POLL_INTERVAL_MS = 6000

export function useSplitEvents(splitId: bigint | null) {
  const [events, setEvents] = useState<PaidEvent[]>([])

  useEffect(() => {
    if (splitId === null) {
      setEvents([])
      return
    }

    let cancelled = false
    let cursor: string | undefined

    const poll = async () => {
      try {
        const latest = await server.getLatestLedger()
        const request = cursor
          ? { filters: [{ type: 'contract' as const, contractIds: [CONTRACT_ID] }], cursor }
          : {
              filters: [{ type: 'contract' as const, contractIds: [CONTRACT_ID] }],
              startLedger: Math.max(latest.sequence - 100, 1),
            }

        const res = await server.getEvents(request)
        cursor = res.cursor

        const paid: PaidEvent[] = []
        for (const event of res.events) {
          const topic0 = event.topic[0] ? scValToNative(event.topic[0]) : null
          if (topic0 !== 'paid') continue
          const eventSplitId = event.topic[1] ? (scValToNative(event.topic[1]) as bigint) : null
          if (eventSplitId === null || eventSplitId !== splitId) continue

          const [payer, amount] = scValToNative(event.value) as [string, bigint]
          paid.push({
            id: event.id,
            splitId: eventSplitId,
            payer,
            amount,
            ledger: event.ledger,
            txHash: event.txHash,
          })
        }

        if (paid.length > 0 && !cancelled) {
          setEvents((prev) => {
            const seen = new Set(prev.map((e) => e.id))
            const fresh = paid.filter((e) => !seen.has(e.id))
            return fresh.length > 0 ? [...prev, ...fresh] : prev
          })
        }
      } catch {
        // Transient RPC hiccups are fine; the next poll will retry.
      }
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [splitId])

  return events
}
