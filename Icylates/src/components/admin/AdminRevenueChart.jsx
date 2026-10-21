function money(value, currency) {
  try { return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${Number(value || 0).toFixed(0)}`; }
}

export default function AdminRevenueChart({ data = [], currency = "USD" }) {
  const max = Math.max(1, ...data.map((entry) => Number(entry.revenue) || 0));
  return (
    <section aria-labelledby="revenue-title" className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Collected revenue</p>
        <h2 id="revenue-title" className="mt-2 text-xl font-semibold text-slate-900">Trailing 12 months</h2>
      </div>
      <div className="flex min-h-56 items-end gap-2 overflow-x-auto" aria-label="Monthly collected revenue chart">
        {data.map((entry) => {
          const height = Math.max(4, Math.round(((Number(entry.revenue) || 0) / max) * 160));
          return (
            <div key={entry.month} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[10px] text-slate-500">{money(entry.revenue, currency)}</span>
              <div title={`${entry.month}: ${money(entry.revenue, currency)} from ${entry.orders} orders`} className="w-full max-w-10 rounded-t-xl bg-gradient-to-b from-pink-500 to-rose-500" style={{ height }} />
              <span className="text-[10px] text-slate-600">{entry.month.slice(5)}</span>
            </div>
          );
        })}
      </div>
      {data.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No revenue data is available.</p>}
    </section>
  );
}
