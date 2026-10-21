import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "IcyTales Admin Dashboard",
  description: "Admin panel for managing users, products and orders",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
