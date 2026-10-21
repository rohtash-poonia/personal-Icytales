"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!isLogin && !loading && (!user || user.role !== "admin")) {
      router.replace(`/admin/login?returnTo=${encodeURIComponent(pathname || "/admin")}`);
    }
  }, [isLogin, loading, pathname, router, user]);

  if (isLogin) return <main className="min-h-screen">{children}</main>;
  if (loading || !user || user.role !== "admin") {
    return <main className="flex min-h-screen flex-1 items-center justify-center p-6" role="status">Checking administrator access…</main>;
  }
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 lg:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
