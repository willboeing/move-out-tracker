const PEOPLE = ['Will Boeing', 'Will Sheffield', 'Kevin McBrayer']

const PERSON_COLORS = {
  'Will Boeing':          { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  'Will Sheffield':       { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
  'Kevin McBrayer':       { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  'Facebook Marketplace': { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' }
}

const fmt = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function SummaryBar({ items }) {
  const totals = {}
  for (const person of PEOPLE) {
    totals[person] = items
      .filter((i) => i.claimed_by === person)
      .reduce((sum, i) => sum + (Number(i.original_cost) || 0), 0)
  }

  const fbItems = items.filter((i) => i.claimed_by === 'Facebook Marketplace')
  const fbCount = fbItems.length
  const fbValue = fbItems.reduce((sum, i) => sum + (Number(i.fb_price) || Number(i.original_cost) || 0), 0)

  return (
    <div className="summary-bar">
      {PEOPLE.map((person) => {
        const colors = PERSON_COLORS[person]
        return (
          <div
            key={person}
            className="summary-card"
            style={{ background: colors.bg, borderColor: colors.border }}
          >
            <span className="summary-name" style={{ color: colors.text }}>{person}</span>
            <span className="summary-amount" style={{ color: colors.text }}>{fmt(totals[person])}</span>
          </div>
        )
      })}

      <div
        className="summary-card"
        style={{ background: PERSON_COLORS['Facebook Marketplace'].bg, borderColor: PERSON_COLORS['Facebook Marketplace'].border }}
      >
        <span className="summary-name" style={{ color: PERSON_COLORS['Facebook Marketplace'].text }}>
          Facebook Marketplace
        </span>
        <span className="summary-amount" style={{ color: PERSON_COLORS['Facebook Marketplace'].text }}>
          {fbCount} item{fbCount !== 1 ? 's' : ''} &bull; {fmt(fbValue)}
        </span>
      </div>
    </div>
  )
}
