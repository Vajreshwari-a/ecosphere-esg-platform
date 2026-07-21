export default function DataTable({ columns, rows, actions, emptyText }) {
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 text-sm">
        {emptyText || "No data to display"}
      </div>
    )
  }

  return (
    <table className="w-full border-collapse bg-white rounded-lg shadow overflow-hidden">
      <thead>
        <tr className="bg-gray-100 text-left text-sm text-gray-600">
          {columns.map((col) => (
            <th key={col.key} className="p-3">{col.label}</th>
          ))}
          {actions && <th className="p-3">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t text-sm">
            {columns.map((col) => (
              <td key={col.key} className="p-3">
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
            {actions && (
              <td className="p-3 space-x-2">
                {actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => action.onClick(row)}
                    disabled={action.isDisabled ? action.isDisabled(row) : false}
                    className="px-3 py-1 text-xs rounded bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {action.label}
                  </button>
                ))}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}