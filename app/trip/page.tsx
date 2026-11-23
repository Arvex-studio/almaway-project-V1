import { GuardShell } from '@/components/guard/shell'
import { TripBook } from '@/components/guard/trip-book'

export default function TripPage() {
  return <GuardShell><div className="ag-page ag-page-narrow">
    <header className="ag-page-header"><h1>Мой поход</h1><p>Сохранённые планы и текст для доверенного человека.</p></header>
    <TripBook />
  </div></GuardShell>
}
