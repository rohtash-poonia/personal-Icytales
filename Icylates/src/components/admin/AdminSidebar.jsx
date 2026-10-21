"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Messages", href: "/admin/messages" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);

  async function handleLogout() {
    setLeaving(true);
    setError("");
    try {
      await logout();
      router.replace("/admin/login");
    } catch (logoutError) {
      setError(logoutError?.message || "Sign out failed. Try again.");
      setLeaving(false);
    }
  }

  return (
    <aside className="flex shrink-0 flex-col border-b border-slate-200 bg-white px-4 py-4 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-6 lg:py-8 xl:w-80">
      <div className="mb-4 lg:mb-10">
        <p className="text-xl font-bold tracking-tight lg:text-2xl">IcyTales Admin</p>
        <p className="mt-1 text-xs text-slate-500 lg:mt-2 lg:text-sm">Platform management</p>
      </div>
      <nav aria-label="Administrator" className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2">
        {navItems.map((item) => {
          const current = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined} className={`block whitespace-nowrap rounded-3xl px-4 py-3 text-sm font-medium ${current ? "bg-pink text-white" : "text-slate-700 hover:bg-slate-100"}`}>{item.label}</Link>;
        })}
      </nav>
      <div className="mt-3 lg:mt-auto">
        <button type="button" disabled={leaving} onClick={handleLogout} className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60">{leaving ? "Signing out…" : "Sign out"}</button>
        {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
      </div>
    </aside>
  );
}
