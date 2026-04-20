import { useState, useEffect } from 'react'

const PEOPLE = ['Will Boeing', 'Will Sheffield', 'Kevin McBrayer', 'Facebook Marketplace']

const PERSON_COLORS = {
  'Will Boeing':          { bg: '#DBEAFE', text: '#1E40AF' },
  'Will Sheffield':       { bg: '#D1FAE5', text: '#065F46' },
  'Kevin McBrayer':       { bg: '#FEF3C7', text: '#92400E' },
  'Facebook Marketplace': { bg: '#F3E8FF', text: '#6B21A8' }
}

const fmt = (n) =>
  n != null ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : ''

const blurOnEnter = (e) => { if (e.key === 'Enter') e.target.blur() }

export default function ItemRow({ item, onUpdate, onDelete }) {
  const [name, setName] = useState(item.name ?? '')
  const [cost, setCost] = useState(item.original_cost != null ? String(item.original_cost) : '')
  const [fbPrice, setFbPrice] = useState(item.fb_price != null ? String(item.fb_price) : '')

  // Sync local state when server broadcasts an update from another client
  useEffect(() => {
    setName(item.name ?? '')
    setCost(item.original_cost != null ? String(item.original_cost) : '')
    setFbPrice(item.fb_price != null ? String(item.fb_price) : '')
  }, [item.name, item.original_cost, item.fb_price])

  const commit = (fields) => onUpdate(item.id, fields)

  const colors = item.claimed_by ? PERSON_COLORS[item.claimed_by] : null

  return (
    <tr className="item-row">
      <td>
        <input
          type="text"
          className="cell-input"
          value={name}
          placeholder="Item name"
          inputMode="text"
          enterKeyHint="done"
          onChange={(e) => setName(e.target.value)}
          onBlur={() => commit({ name })}
          onKeyDown={blurOnEnter}
        />
      </td>

      <td>
        <div className="cost-cell">
          <span className="currency-prefix">$</span>
          <input
            type="number"
            className="cell-input cost-input"
            value={cost}
            placeholder="0.00"
            min="0"
            step="0.01"
            inputMode="decimal"
            enterKeyHint="done"
            onChange={(e) => setCost(e.target.value)}
            onBlur={() => commit({ original_cost: cost === '' ? null : parseFloat(cost) })}
            onKeyDown={blurOnEnter}
          />
        </div>
      </td>

      <td>
        <div className="claimed-cell">
          <select
            className="cell-select"
            value={item.claimed_by ?? ''}
            onChange={(e) => commit({ claimed_by: e.target.value || null })}
          >
            <option value="">— unassigned —</option>
            {PEOPLE.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {colors && (
            <span
              className="person-badge"
              style={{ background: colors.bg, color: colors.text }}
            >
              {item.claimed_by}
            </span>
          )}
        </div>
      </td>

      <td>
        {item.claimed_by === 'Facebook Marketplace' ? (
          <div className="cost-cell">
            <span className="currency-prefix">$</span>
            <input
              type="number"
              className="cell-input cost-input"
              value={fbPrice}
              placeholder="0.00"
              min="0"
              step="0.01"
              inputMode="decimal"
              enterKeyHint="done"
              onChange={(e) => setFbPrice(e.target.value)}
              onBlur={() => commit({ fb_price: fbPrice === '' ? null : parseFloat(fbPrice) })}
              onKeyDown={blurOnEnter}
            />
          </div>
        ) : (
          <span className="cell-dash">&mdash;</span>
        )}
      </td>

      <td>
        <button
          className="btn-delete"
          onClick={() => onDelete(item.id)}
          title="Delete item"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}
