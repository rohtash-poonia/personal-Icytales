const AdminMetricCard = ({ title, value, delta, note }) => {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
      {delta && <p className="mt-2 text-sm text-emerald-600">{delta}</p>}
      {note && <p className="mt-4 text-sm text-slate-500">{note}</p>}
    </div>
  );
};

export default AdminMetricCard;
