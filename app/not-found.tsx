import Link from 'next/link'
import { GuardShell } from '@/components/guard/shell'

export default function NotFound() {
  return <GuardShell><div className="ag-page ag-page-narrow">
    <header className="ag-page-header"><h1>Страница не найдена</h1><p>Проверьте ссылку или выберите маршрут в каталоге.</p></header>
    <Link href="/routes" className="ag-button">Все маршруты</Link>
  </div></GuardShell>
}
