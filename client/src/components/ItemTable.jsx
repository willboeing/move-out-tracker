import ItemRow from './ItemRow'

export default function ItemTable({ items, onUpdate, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="items-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Original Cost</th>
            <th>Claimed By</th>
            <th>FB Marketplace Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-state">
                No items yet — click &ldquo;+ Add Item&rdquo; to get started
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <ItemRow key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
