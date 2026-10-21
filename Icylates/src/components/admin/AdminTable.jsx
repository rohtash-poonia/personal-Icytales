"use client";

const AdminTable = ({ columns, rows, emptyMessage = "No records found." }) => (
  <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full border-collapse text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>{columns.map((column) => <th scope="col" key={column.key} className="whitespace-nowrap px-5 py-4 font-semibold uppercase tracking-[0.18em]">{column.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length} className="px-5 py-10 text-center text-slate-500">{emptyMessage}</td></tr>
        ) : rows.map((row, index) => (
          <tr key={row._id || row.id || index} className="border-t border-slate-200 transition-colors hover:bg-slate-50">
            {columns.map((column) => <td key={column.key} className="px-5 py-4 text-slate-700">{column.render ? column.render(row) : row[column.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminTable;
