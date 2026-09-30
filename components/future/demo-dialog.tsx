'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function DemoDialog({ title, eyebrow = 'ALMAWAY · PREVIEW', children, onClose }: { title: string; eyebrow?: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement as HTMLElement | null
    dialog?.showModal()
    return () => {
      dialog?.close()
      previousFocus?.focus()
    }
  }, [])
  return <dialog ref={ref} className="preview-dialog" aria-label={title} onClose={event => { if (!event.currentTarget.open) onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}><div className="dialog-card"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{children}</p><button type="button" className="primary-button" onClick={onClose}>Понятно</button></div></dialog>
}

export function DemoAction({ title, children, className, label, description }: { title: string; children: ReactNode; className?: string; label?: string; description: string }) {
  const [open, setOpen] = useState(false)
  return <><button type="button" className={className} aria-label={label} onClick={() => setOpen(true)}>{children}</button>{open && <DemoDialog title={title} onClose={() => setOpen(false)}>{description}</DemoDialog>}</>
}
