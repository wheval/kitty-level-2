export type KittyErrorType =
  | 'wallet_not_found'
  | 'rejected'
  | 'insufficient_balance'
  | 'unknown'

export type KittyError = {
  type: KittyErrorType
  message: string
}

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message
  }
  return 'Something went wrong.'
}

export function classifyError(err: unknown): KittyError {
  const raw = extractMessage(err)
  const lower = raw.toLowerCase()

  if (
    lower.includes('not installed') ||
    lower.includes('not available') ||
    lower.includes('no wallet') ||
    lower.includes('extension not found')
  ) {
    return {
      type: 'wallet_not_found',
      message: 'No compatible wallet was found. Install one (e.g. Freighter) and try again.',
    }
  }

  if (
    lower.includes('rejected') ||
    lower.includes('declined') ||
    lower.includes('user cancelled') ||
    lower.includes('user canceled') ||
    lower.includes('closed') ||
    lower.includes('denied')
  ) {
    return {
      type: 'rejected',
      message: 'The request was rejected in your wallet.',
    }
  }

  if (
    lower.includes('insufficient') ||
    lower.includes('underfunded') ||
    lower.includes('balance') && lower.includes('low') ||
    lower.includes('trustline') ||
    lower.includes('tx_insufficient_balance')
  ) {
    return {
      type: 'insufficient_balance',
      message: "You don't have enough XLM to complete this transaction.",
    }
  }

  return { type: 'unknown', message: raw }
}
