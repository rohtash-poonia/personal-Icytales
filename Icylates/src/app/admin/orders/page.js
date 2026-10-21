"use client";

import { useCallback, useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTable from "@/components/admin/AdminTable";
import Button from "@/components/common/Button";
import { collectCash, deleteOrder, getAdminOrders, updateOrderStatus } from "@/lib/api";

const STATUS_OPTIONS = ["pending", "processing", "completed", "cancelled"];

function money(value, currency = "USD") {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(Number(value) || 0);
  } catch {
    return `${currency} ${(Number(value) || 0).toFixed(2)}`;
  }
}

function statusClass(status) {
  return {
    completed: "bg-green-100 text-green-700",
    processing: "bg-indigo-100 text-indigo-700",
    cancelled: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  }[status] || "bg-amber-100 text-amber-700";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const loadOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminOrders({ page, limit: 25 });
      setOrders(Array.isArray(data?.items) ? data.items : []);
      setPagination(data?.pagination || { page, pages: 1, total: 0, limit: 25 });
    } catch (loadError) {
      setError(loadError?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { queueMicrotask(() => loadOrders()); }, [loadOrders]);

  async function runAction(key, action) {
    setPendingAction(key);
    setError("");
    try {
      await action();
      await loadOrders(pagination.page);
    } catch (actionError) {
      setError(actionError?.message || "The order could not be updated.");
    } finally {
      setPendingAction("");
    }
  }

  function handleStatusChange(id, status) {
    return runAction(`status:${id}`, () => updateOrderStatus(id, status));
  }

  function handleCollectCash(id) {
    if (!window.confirm("Confirm that cash was actually received for this order.")) return;
    return runAction(`cash:${id}`, () => collectCash(id));
  }

  function handleArchive(id) {
    if (!window.confirm("Archive this cancelled unpaid order? Its accounting history will be retained.")) return;
    return runAction(`archive:${id}`, () => deleteOrder(id));
  }

  const rows = orders.map((order) => ({
    ...order,
    orderId: String(order._id || "").slice(-6).toUpperCase(),
    customer: order.user?.name || order.shippingAddress?.fullName || "Customer",
    amount: money(order.totalPrice, order.currency),
    payment: order.paymentStatus,
    status: order.orderStatus,
  }));

  const columns = [
    { key: "orderId", label: "Order #" },
    { key: "customer", label: "Customer name" },
    { key: "amount", label: "Amount" },
    { key: "payment", label: "Payment", render: (row) => (
      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(row.paymentStatus)}`}>{row.paymentStatus}</span>
    ) },
    { key: "status", label: "Status", render: (row) => (
      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(row.orderStatus)}`}>{row.orderStatus}</span>
    ) },
    { key: "actions", label: "Actions", render: (row) => {
      const busy = pendingAction.endsWith(`:${row._id}`);
      const canCollect = row.paymentMethod === "cod" && row.paymentStatus === "pending" && ["processing", "completed"].includes(row.orderStatus);
      const canArchive = row.orderStatus === "cancelled" && row.paymentStatus !== "paid";
      return (
        <div className="flex min-w-56 flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`status-${row._id}`}>Status for order {row.orderId}</label>
          <select
            id={`status-${row._id}`}
            aria-label={`Status for order ${row.orderId}`}
            value={row.orderStatus}
            disabled={busy || ["completed", "cancelled"].includes(row.orderStatus)}
            onChange={(event) => handleStatusChange(row._id, event.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#F83D8E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
          </select>
          {canCollect && <Button size="sm" theme="primary" loading={pendingAction === `cash:${row._id}`} onClick={() => handleCollectCash(row._id)}>Cash collected</Button>}
          {canArchive && <Button size="sm" variant="outline" loading={pendingAction === `archive:${row._id}`} onClick={() => handleArchive(row._id)}>Archive</Button>}
        </div>
      );
    } },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader title="Orders" subtitle="Review orders, fulfilment and verified payment collection." />
      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => loadOrders(pagination.page)}>Retry</Button>
        </div>
      )}
      {loading ? (
        <div role="status" className="rounded-[32px] border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#F83D8E] border-t-transparent" />
          Loading orders...
        </div>
      ) : (
        <>
          <AdminTable columns={columns} rows={rows} emptyMessage="No orders found." />
          {pagination.pages > 1 && (
            <nav aria-label="Orders pagination" className="flex items-center justify-end gap-3 text-sm">
              <Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => loadOrders(pagination.page - 1)}>Previous</Button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <Button size="sm" variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => loadOrders(pagination.page + 1)}>Next</Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
