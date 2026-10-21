"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminRevenueChart from "@/components/admin/AdminRevenueChart";
import Button from "@/components/common/Button";
import { getDashboardStats } from "@/lib/api";

function currency(value, code = "USD") {
  try { return new Intl.NumberFormat("en", { style: "currency", currency: code }).format(Number(value) || 0); }
  catch { return `${code} ${(Number(value) || 0).toFixed(2)}`; }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setStats(await getDashboardStats()); }
    catch (loadError) { setError(loadError?.message || "Unable to load dashboard statistics."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { queueMicrotask(() => load()); }, [load]);

  const counts = stats?.counts || {};
  const revenue = stats?.revenue || { collected: 0, pending: 0, currency: "USD" };
  const metrics = [
    { title: "Users", value: counts.users ?? 0, note: "Registered accounts" },
    { title: "Products", value: counts.products ?? 0, note: "Non-archived catalog items" },
    { title: "Orders", value: counts.orders ?? 0, note: `${counts.pendingOrders ?? 0} pending fulfilment` },
    { title: "Collected revenue", value: currency(revenue.collected, revenue.currency), note: `${currency(revenue.pending, revenue.currency)} awaiting collection` },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader title="Dashboard" subtitle="Verified platform totals and collected revenue." />
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"><span>{error}</span><Button variant="outline" onClick={load}>Retry</Button></div>}
      {loading ? <div role="status" className="rounded-4xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading dashboard…</div> : stats && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((card) => <AdminMetricCard key={card.title} {...card} />)}</div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <AdminRevenueChart data={stats.monthly} currency={revenue.currency} />
            <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Management</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Common tasks</h2>
              <div className="mt-5 grid gap-3">
                <Link className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 hover:border-pink" href="/admin/orders">Review pending orders</Link>
                <Link className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 hover:border-pink" href="/admin/products">Manage products and inventory</Link>
                <Link className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 hover:border-pink" href="/admin/users">Manage customer access</Link>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
