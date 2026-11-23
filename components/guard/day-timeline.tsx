import { Sunrise, TriangleAlert } from 'lucide-react'
import { clockLabel, type DayPlan } from '@/lib/guard/planning'
import { durationLabel } from '@/lib/guard/routes'

export function DayTimeline({ day, restMinutes }: { day: DayPlan; restMinutes: number }) {
  return <section className="ag-card ag-panel" aria-labelledby="ag-day-title">
    <div className="ag-panel-heading"><h2 id="ag-day-title"><Sunrise aria-hidden="true" /> Световой день</h2></div>
    <dl className="ag-daylight">
      <div><dt>Восход</dt><dd>{clockLabel(day.sunrise)}</dd></div>
      <div><dt>Закат</dt><dd>{clockLabel(day.sunset)}</dd></div>
    </dl>
    <p>Расчёт для района Алматы. В ущелье и за хребтом может стемнеть раньше. <a className="ag-source" href="https://gml.noaa.gov/grad/solcalc/solareqns.PDF" target="_blank" rel="noreferrer">Метод NOAA</a></p>
    {(day.afterDark || day.shortMargin) && <div className="ag-notice ag-notice-warning"><TriangleAlert aria-hidden="true" /><p>{day.afterDark
      ? 'Часть вашего плана выходит за расчётный световой день.'
      : 'От возвращения до расчётного заката меньше часа.'}</p></div>}
    <h3>Окно похода</h3>
    <ol className="ag-timeline">
      <li><time>{clockLabel(day.starts)}</time><span>Выход по вашему плану</span></li>
      <li><b>{durationLabel(day.walking)}</b><span>Время в окне за вычетом {restMinutes} мин привала</span></li>
      <li><time>{clockLabel(day.returns)}</time><span>Планируемое возвращение</span></li>
    </ol>
  </section>
}
