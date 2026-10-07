import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/** Bottom sheet on phones, centred dialog on wide screens. Uses the native <dialog> for focus handling. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      if (typeof d.showModal === 'function') d.showModal()
      else d.setAttribute('open', '')
    }
    if (!open && d.open) {
      if (typeof d.close === 'function') d.close()
      else d.removeAttribute('open')
    }
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto w-full max-w-none rounded-t-2xl border border-line bg-surface p-0 text-ink backdrop:bg-black/40 sm:m-auto sm:max-w-lg sm:rounded-2xl"
    >
      <div className="max-h-[80dvh] overflow-y-auto p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" className="btn min-h-9 px-3" onClick={onClose} aria-label={t('common.close')}>✕</button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
