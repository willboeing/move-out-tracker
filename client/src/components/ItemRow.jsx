import { useState, useEffect } from 'react'

const PEOPLE = ['Will Boeing', 'Will Sheffield', 'Kevin McBrayer', 'Facebook Marketplace']

const PERSON_COLORS = {
  'Will Boeing':          { bg: '#DBEAFE', text: '#1E40AF' },
  'Will Sheffield':       { bg: '#D1FAE5', text: '#065F46' },
  'Kevin McBrayer':       { bg: '#FEF3C7', text: '#92400E' },
  'Facebook Marketplace': { bg: '#F3E8FF', text: '#6B21A8' }
}

const blurOnEnter = (e) => { if (e.key === 'Enter') e.target.blur() }

export default function ItemRow({ item, onUpdate, onDelete }) {
  const [name, setName] = useState(item.name ?? '')
  const [cost, setCost] = useState(item.original_cost != null ? String(item.original_cost) : '')
  const [claimedBy, setClaimedBy] = useState(item.claimed_by ?? '')
  const [fbPrice, setFbPrice] = useState(item.fb_price != null ? String(item.fb_price) : '')

  // Sync all fields from server broadcasts. claimed_by must be in deps —
  // it has no other reactive path to update the select on other clients.
  useEffect(() => {
    setName(item.name ?? '')
    setCost(item.original_cost != null ? String(item.original_cost) : '')
    setClaimedBy(item.claimed_by ?? '')
    setFbPrice(item.fb_price != null ? String(item.fb_price) : '')
  }, [item.name, item.original_cost, item.claimed_by, item.fb_price])

  const commit = (fields) => onUpdate(item.id, fields)

  const colors = claimedBy ? PERSON_COLORS[claimedBy] : null

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
            value={claimedBy}
            onChange={(e) => {
              const val = e.target.value
              setClaimedBy(val)
              commit({ claimed_by: val || null })
            }}
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
              {claimedBy}
            </span>
          )}
        </div>
      </td>

      <td>
        {claimedBy === 'Facebook Marketplace' ? (
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
