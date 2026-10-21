"use client";

import { useCallback, useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTable from "@/components/admin/AdminTable";
import Button from "@/components/common/Button";
import { blockUser, deleteUser, getUsers } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try {
      const data = await getUsers({ page, limit: 25 });
      setUsers(Array.isArray(data?.items) ? data.items : []);
      setPagination(data?.pagination || { page, pages: 1 });
    } catch (loadError) { setError(loadError?.message || "Unable to load users."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { queueMicrotask(() => load()); }, [load]);

  async function mutate(key, action) {
    setPending(key); setError("");
    try { await action(); await load(pagination.page); }
    catch (mutationError) { setError(mutationError?.message || "The user could not be updated."); }
    finally { setPending(""); }
  }

  function toggle(item) {
    if (!window.confirm(`${item.isBlocked ? "Unblock" : "Block"} ${item.name}?`)) return;
    mutate(`block:${item._id}`, () => blockUser(item._id, !item.isBlocked));
  }
  function remove(item) {
    if (!window.confirm(`Delete ${item.name}'s account? This cannot be undone.`)) return;
    mutate(`delete:${item._id}`, () => deleteUser(item._id));
  }

  const columns = [
    { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "role", label: "Role" },
    { key: "status", label: "Status", render: (item) => <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{item.isBlocked ? "blocked" : "active"}</span> },
    { key: "createdAt", label: "Joined", render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—" },
    { key: "actions", label: "Actions", render: (item) => item.role === "admin" || String(item._id) === String(currentUser?.id) ? <span className="text-xs text-slate-500">Protected administrator</span> : (
      <div className="flex gap-3">
        <button disabled={Boolean(pending)} onClick={() => toggle(item)} className="font-medium text-amber-700 disabled:opacity-50">{item.isBlocked ? "Unblock" : "Block"}</button>
        <button disabled={Boolean(pending)} onClick={() => remove(item)} className="font-medium text-red-600 disabled:opacity-50">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader title="Users" subtitle="Manage customer account access." />
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"><span>{error}</span><Button variant="outline" onClick={() => load(pagination.page)}>Retry</Button></div>}
      {loading ? <div role="status" className="rounded-4xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading users…</div> : <AdminTable columns={columns} rows={users} emptyMessage="No users found." />}
      {pagination.pages > 1 && <nav aria-label="Users pagination" className="flex justify-end gap-3"><Button variant="outline" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</Button><span className="self-center text-sm">Page {pagination.page} of {pagination.pages}</span><Button variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => load(pagination.page + 1)}>Next</Button></nav>}
    </div>
  );
}
