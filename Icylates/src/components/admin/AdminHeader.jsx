"use client";

import { useAuth } from "@/components/context/AuthContext";

export default function AdminHeader({ title, subtitle }) {
  const { user } = useAuth();
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-pink-600">Admin panel</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signed in</p>
        <p className="mt-2 text-sm font-medium text-slate-900">{user?.name || user?.email || "Administrator"}</p>
      </div>
    </div>
  );
}
