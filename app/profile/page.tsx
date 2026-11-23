import { Profile } from '@/components/guard/profile'
import { GuardShell } from '@/components/guard/shell'

export default function ProfilePage() {
  return <GuardShell><div className="ag-page ag-page-narrow">
    <header className="ag-page-header"><h1>Профиль</h1><p>Ваш опыт в горах и данные на этом устройстве.</p></header>
    <Profile />
  </div></GuardShell>
}
