const PEOPLE = ['Will Boeing', 'Will Sheffield', 'Kevin McBrayer', 'Facebook Marketplace']

const fmt = (n) =>
  n != null ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00'

export default function ExportButton({ items }) {
  const handleExport = () => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    const lines = [`Move-Out Item Summary`, `Generated: ${date}`, '']

    for (const person of PEOPLE) {
      const personItems = items.filter((i) => i.claimed_by === person)
      lines.push(`=== ${person} ===`)

      if (personItems.length === 0) {
        lines.push('  (no items)')
      } else if (person === 'Facebook Marketplace') {
        for (const item of personItems) {
          const name = item.name || '(unnamed)'
          const cost = fmt(item.original_cost)
          const asking = fmt(item.fb_price)
          lines.push(`  - ${name}: original ${cost}, asking ${asking}`)
        }
        const count = personItems.length
        const combined = personItems.reduce((s, i) => s + (Number(i.fb_price) || Number(i.original_cost) || 0), 0)
        lines.push(`  Count: ${count} item${count !== 1 ? 's' : ''} | Combined asking: ${fmt(combined)}`)
      } else {
        for (const item of personItems) {
          lines.push(`  - ${item.name || '(unnamed)'}: ${fmt(item.original_cost)}`)
        }
        const total = personItems.reduce((s, i) => s + (Number(i.original_cost) || 0), 0)
        lines.push(`  Total: ${fmt(total)}`)
      }

      lines.push('')
    }

    const text = lines.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'move-out-summary.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button className="btn-export" onClick={handleExport}>
      Export Summary
    </button>
  )
}
