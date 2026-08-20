import type { TxStatus } from '../lib/txStatus'
import type { KittyError } from '../lib/errors'

type TransactionStatusProps = {
  status: TxStatus
  hash: string | null
  error: KittyError | null
  successLabel?: string
}

export function TransactionStatus({
  status,
  hash,
  error,
  successLabel = 'Confirmed on-chain',
}: TransactionStatusProps) {
  if (status === 'idle') return null

  if (status === 'pending') {
    return (
      <div className="status-banner status-pending">
        ⏳ {hash ? 'Awaiting confirmation…' : 'Submitting transaction…'}
        {hash && (
          <>
            {' '}
            <span className="mono">{hash.slice(0, 12)}…</span>
          </>
        )}
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="status-banner status-success">
        ✅ {successLabel}
        {hash && (
          <>
            {' — '}
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
            >
              view on Stellar Expert
            </a>
          </>
        )}
      </div>
    )
  }

  return <div className="status-banner status-error">❌ {error?.message ?? 'Transaction failed'}</div>
}
