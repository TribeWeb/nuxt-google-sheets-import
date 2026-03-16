interface ToastLike {
  add: (payload: {
    title?: string
    description?: string
    color?: 'success' | 'error' | 'warning' | 'info' | 'neutral'
  }) => void
}

interface CopyTextWithToastOptions {
  text: string
  toast: ToastLike
  description: string
  title?: string
}

export async function copyTextWithSuccessToast(options: CopyTextWithToastOptions): Promise<boolean> {
  if (!options.text) {
    return false
  }

  await navigator.clipboard.writeText(options.text)
  options.toast.add({
    title: options.title ?? 'Copied',
    description: options.description,
    color: 'success',
  })

  return true
}
