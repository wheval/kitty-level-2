import { useEffect, useState } from 'react'
import './App.css'
import { useWallet } from './hooks/useWallet'
import { useCreateSplit } from './hooks/useCreateSplit'
import { usePayShare } from './hooks/usePayShare'
import { useSplit } from './hooks/useSplit'
import { useSplitEvents } from './hooks/useSplitEvents'
import { WalletConnect } from './components/WalletConnect'
import { CreateSplit } from './components/CreateSplit'
import { SplitStatus } from './components/SplitStatus'
import { TransactionStatus } from './components/TransactionStatus'

function App() {
  const wallet = useWallet()
  const createSplit = useCreateSplit(wallet.address)
  const payShare = usePayShare(wallet.address)

  const [splitId, setSplitId] = useState<bigint | null>(null)
  const [lookupInput, setLookupInput] = useState('')

  const { split, refresh } = useSplit(splitId)
  const events = useSplitEvents(splitId)

  // Once a split is created, automatically show it.
  useEffect(() => {
    if (createSplit.status === 'success' && createSplit.result !== null) {
      setSplitId(createSplit.result)
    }
  }, [createSplit.status, createSplit.result])

  // After a successful payment, re-fetch the split so badges update immediately
  // (in addition to the live event feed).
  useEffect(() => {
    if (payShare.status === 'success') refresh()
  }, [payShare.status, refresh])

  const handleLookup = () => {
    const trimmed = lookupInput.trim()
    if (/^\d+$/.test(trimmed)) {
      setSplitId(BigInt(trimmed))
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🐱 Kitty</h1>
        <p className="tagline">Split a bill, settle it on-chain.</p>
      </header>

      <WalletConnect
        address={wallet.address}
        connecting={wallet.connecting}
        error={wallet.error}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
      />

      <CreateSplit
        disabled={!wallet.address}
        pending={createSplit.status === 'pending'}
        onCreate={(recipients, amounts) => createSplit.createSplit(recipients, amounts)}
      />
      <TransactionStatus
        status={createSplit.status}
        hash={createSplit.hash}
        error={createSplit.error}
        successLabel={`Split #${createSplit.result?.toString() ?? ''} created`}
      />

      <div className="card">
        <label htmlFor="lookup">View an existing split by ID</label>
        <div className="recipient-row">
          <input
            id="lookup"
            placeholder="0"
            value={lookupInput}
            onChange={(e) => setLookupInput(e.target.value)}
          />
          <button className="btn-secondary" onClick={handleLookup} type="button">
            View
          </button>
        </div>
      </div>

      {splitId !== null && split && (
        <>
          <SplitStatus
            splitId={splitId}
            split={split}
            myAddress={wallet.address}
            payPending={payShare.status === 'pending'}
            onPay={() => payShare.payShare(splitId)}
            events={events}
            onRefresh={refresh}
          />
          <TransactionStatus
            status={payShare.status}
            hash={payShare.hash}
            error={payShare.error}
            successLabel="Your share is paid"
          />
        </>
      )}
    </div>
  )
}

export default App
