import { useState } from 'react'
import { StrKey } from '@stellar/stellar-sdk'

type Recipient = { address: string; amount: string }

type CreateSplitProps = {
  disabled: boolean
  pending: boolean
  onCreate: (recipients: string[], amounts: bigint[]) => void
}

function toStroops(xlm: string): bigint | null {
  const num = Number(xlm)
  if (!num || num <= 0) return null
  return BigInt(Math.round(num * 10_000_000))
}

export function CreateSplit({ disabled, pending, onCreate }: CreateSplitProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: '', amount: '' },
    { address: '', amount: '' },
  ])

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    setRecipients((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    )
  }

  const addRecipient = () => setRecipients((prev) => [...prev, { address: '', amount: '' }])
  const removeRecipient = (index: number) =>
    setRecipients((prev) => prev.filter((_, i) => i !== index))

  const validRecipients = recipients.filter(
    (r) => StrKey.isValidEd25519PublicKey(r.address.trim()) && toStroops(r.amount) !== null,
  )
  const canSubmit = validRecipients.length === recipients.length && recipients.length > 0 && !disabled

  const total = recipients.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

  const handleSubmit = () => {
    const addresses = recipients.map((r) => r.address.trim())
    const amounts = recipients.map((r) => toStroops(r.amount)!)
    onCreate(addresses, amounts)
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Create a split</h2>

      {recipients.map((r, i) => {
        const addressValid =
          r.address.trim().length === 0 || StrKey.isValidEd25519PublicKey(r.address.trim())
        return (
          <div key={i}>
            <div className="recipient-row">
              <input
                placeholder="Recipient address (G...)"
                value={r.address}
                onChange={(e) => updateRecipient(i, 'address', e.target.value)}
              />
              <input
                className="amount-input"
                type="number"
                min="0"
                step="0.0000001"
                placeholder="XLM"
                value={r.amount}
                onChange={(e) => updateRecipient(i, 'amount', e.target.value)}
              />
              {recipients.length > 1 && (
                <button
                  className="btn-secondary btn-small"
                  onClick={() => removeRecipient(i)}
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
            {!addressValid && <p className="error">Invalid Stellar address</p>}
          </div>
        )
      })}

      <button className="btn-secondary btn-small" onClick={addRecipient} type="button">
        + Add recipient
      </button>

      {total > 0 && (
        <p className="muted" style={{ marginTop: 14 }}>
          Total: <strong className="mono">{total} XLM</strong>
        </p>
      )}

      <button
        className="btn-primary"
        style={{ marginTop: 8 }}
        disabled={!canSubmit || pending}
        onClick={handleSubmit}
      >
        {pending ? 'Creating…' : 'Create split'}
      </button>

      {disabled && <p className="muted">Connect your wallet to create a split.</p>}
    </div>
  )
}
