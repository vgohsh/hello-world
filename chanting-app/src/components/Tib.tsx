import type { ReactNode } from 'react'

/** Tibetan-script text: correct language tag and the bundled Tibetan font. */
export function Tib({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span lang="bo" className={`tib ${className}`}>
      {children}
    </span>
  )
}
