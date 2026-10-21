"use client";

import { useCallback, useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTable from "@/components/admin/AdminTable";
import Button from "@/components/common/Button";
import { getContactMessages } from "@/lib/api";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try {
      const data = await getContactMessages({ page, limit: 25 });
      setMessages(Array.isArray(data?.items) ? data.items : []);
      setPagination(data?.pagination || { page, pages: 1 });
    } catch (loadError) { setError(loadError?.message || "Unable to load messages."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { queueMicrotask(() => load()); }, [load]);

  const columns = [
    { key: "name", label: "Sender", render: (item) => `${item.firstName} ${item.lastName}` },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (item) => item.phone || "—" },
    { key: "message", label: "Message", render: (item) => <p className="max-w-md whitespace-pre-wrap">{item.message}</p> },
    { key: "createdAt", label: "Received", render: (item) => new Date(item.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader title="Messages" subtitle="Contact requests submitted through the website." />
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"><span>{error}</span><Button variant="outline" onClick={() => load(pagination.page)}>Retry</Button></div>}
      {loading ? <div role="status" className="rounded-[32px] border border-slate-200 bg-white p-12 text-center text-slate-600">Loading messages…</div> : <AdminTable columns={columns} rows={messages} emptyMessage="No messages received." />}
      {pagination.pages > 1 && <nav aria-label="Messages pagination" className="flex justify-end gap-3"><Button variant="outline" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</Button><span className="self-center text-sm">Page {pagination.page} of {pagination.pages}</span><Button variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => load(pagination.page + 1)}>Next</Button></nav>}
    </div>
  );
}
