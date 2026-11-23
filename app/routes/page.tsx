import Image from 'next/image'
import { Catalog } from '@/components/guard/catalog'
import { GuardShell } from '@/components/guard/shell'

const photoSource = 'https://commons.wikimedia.org/wiki/File:Le_Alatau_Mountains,_Almaty,_Kazakhstan.jpg'

export default function RoutesPage() {
  return <GuardShell><div className="ag-page">
    <header className="ag-catalog-heading">
      <div className="ag-page-header"><span className="ag-kicker">Заилийский Алатау</span><h1>Маршруты</h1>
        <p>Сравните варианты по набору высоты, дистанции и времени из источника.</p>
      </div>
      <figure className="ag-region-photo">
        <Image src="/guard/alatau.webp" alt="Горный пейзаж Заилийского Алатау в районе Медеу" fill sizes="(min-width: 820px) 460px, 100vw" />
        <figcaption>Заилийский Алатау · <a href={photoSource}>Danatleg122</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · кадрировано</figcaption>
      </figure>
    </header>
    <Catalog />
  </div></GuardShell>
}
