import type { KittyError } from '../lib/errors'

type WalletConnectProps = {
  address: string | null
  connecting: boolean
  error: KittyError | null
  onConnect: () => void
  onDisconnect: () => void
}

function shorten(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function WalletConnect({
  address,
  connecting,
  error,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  return (
    <div className="card">
      {address ? (
        <div className="row">
          <div>
            <label>Connected wallet</label>
            <p className="mono">{shorten(address)}</p>
          </div>
          <button className="btn-secondary" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <>
          <button className="btn-primary" onClick={onConnect} disabled={connecting}>
            {connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
          <p className="muted" style={{ marginTop: 8 }}>
            Freighter, xBull, Albedo, Lobstr, Rabet, or Hana
          </p>
          {error && <p className="error">{error.message}</p>}
        </>
      )}
    </div>
  )
}
