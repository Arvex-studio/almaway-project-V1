import Link from 'next/link'
import { Mountain, ArrowUpRight } from 'lucide-react'
export function Masthead() {
  return (
    <header className="atlas-masthead">
      <Link href="/map" className="atlas-brand">
        <Mountain aria-hidden="true" /> ALMAWAY<span>ALPINE ATLAS</span>
      </Link>
      <span className="atlas-edition">АЛМАТЫ · КАЗАХСТАН</span>
      <Link href="/explore" aria-label="Каталог мест">
        <ArrowUpRight />
      </Link>
    </header>
  )
}
export function PhotoCredit() {
  return (
    <figcaption className="photo-credit">
      <a
        href="https://commons.wikimedia.org/wiki/File:Big_Almaty_Lake_Winter.jpg"
        target="_blank"
        rel="noreferrer"
      >
        Фото: Amarkiev / Wikimedia Commons
      </a>{' '}
      ·{' '}
      <a
        href="https://creativecommons.org/licenses/by-sa/4.0/"
        target="_blank"
        rel="noreferrer"
      >
        CC BY-SA 4.0
      </a>{' '}
      · кадрирование
    </figcaption>
  )
}
