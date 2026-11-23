import { Backpack } from 'lucide-react'
import { packingGroups, type PackingItem } from '@/lib/guard/packing'

export function PackingList({ items, checked, onChange }: {
  items: PackingItem[]; checked: string[]; onChange: (id: string, value: boolean) => void
}) {
  return <section className="ag-card ag-panel" aria-labelledby="ag-packing-title">
    <div className="ag-panel-heading"><h2 id="ag-packing-title"><Backpack aria-hidden="true" /> Снаряжение</h2>
      <span aria-live="polite" className="ag-code">{items.filter(item => checked.includes(item.id)).length} / {items.length}</span></div>
    {packingGroups.map(group => {
      const list = items.filter(item => item.group === group)
      return list.length > 0 && <fieldset className="ag-packing-group" key={group}>
        <legend>{group}</legend>
        {list.map(item => <label className="ag-packing-item" key={item.id}>
          <input type="checkbox" checked={checked.includes(item.id)} onChange={event => onChange(item.id, event.target.checked)} />
          <span><strong>{item.name}</strong><small>{item.reason}</small></span>
        </label>)}
      </fieldset>
    })}
  </section>
}
