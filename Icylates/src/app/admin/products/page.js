"use client";

import { useCallback, useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTable from "@/components/admin/AdminTable";
import ProductModal from "@/components/admin/ProductModal";
import Button from "@/components/common/Button";
import SafeImage from "@/components/common/SafeImage";
import { createProduct, deleteProduct, getAdminProducts, updateProduct } from "@/lib/api";

function money(value) { return new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(Number(value) || 0); }

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try {
      const data = await getAdminProducts({ page, limit: 25 });
      setProducts(Array.isArray(data?.items) ? data.items : []);
      setPagination(data?.pagination || { page, pages: 1 });
    } catch (loadError) { setError(loadError?.message || "Unable to load products."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { queueMicrotask(() => load()); }, [load]);

  async function save(payload, files, onProgress) {
    const result = modal?._id
      ? await updateProduct(modal._id, payload, { files, onProgress })
      : await createProduct(payload, { files, onProgress });
    setNotice(`${payload.title} was ${modal?._id ? "updated" : "created"}.${result?.warnings?.length ? ` ${result.warnings.join(" ")}` : ""}`);
    setModal(null);
    await load(pagination.page);
  }

  async function remove(product) {
    if (!window.confirm(`Delete ${product.title}? Existing order snapshots will be retained.`)) return;
    setPendingDelete(product._id); setError("");
    try {
      const result = await deleteProduct(product._id);
      setNotice(`${product.title} was deleted.${result?.warnings?.length ? ` ${result.warnings.join(" ")}` : ""}`);
      await load(pagination.page);
    }
    catch (deleteError) { setError(deleteError?.message || "The product could not be deleted."); }
    finally { setPendingDelete(""); }
  }

  const columns = [
    { key: "image", label: "Image", render: (item) => { const image = item.images?.[0]; return <SafeImage src={typeof image === "string" ? image : image?.url} alt="" width={56} height={56} className="h-14 w-14 rounded-xl bg-[#fff5fa] object-contain" />; } },
    { key: "title", label: "Product", render: (item) => <div><p className="font-semibold text-slate-900">{item.title}</p>{item.flavor && <p className="text-xs text-slate-500">{item.flavor}</p>}</div> }, { key: "category", label: "Category" },
    { key: "price", label: "Price", render: (item) => money(item.price) },
    { key: "stock", label: "Stock" },
    { key: "status", label: "Status", render: (item) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "active" ? "bg-green-100 text-green-700" : item.status === "archived" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>{item.status}</span> },
    { key: "actions", label: "Actions", render: (item) => <div className="flex gap-3"><button onClick={() => setModal(item)} className="font-medium text-blue-600">Edit</button><button disabled={pendingDelete === item._id} onClick={() => remove(item)} className="font-medium text-red-600 disabled:opacity-50">{pendingDelete === item._id ? "Deleting…" : "Delete"}</button></div> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminHeader title="Products" subtitle="Create products and manage catalog inventory." />
        <Button theme="primary" onClick={() => setModal({})} className="min-h-11 px-5 sm:w-auto">+ Add Product</Button>
      </div>
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"><span>{error}</span><Button variant="outline" onClick={() => load(pagination.page)}>Retry</Button></div>}
      {notice && <div role="status" className="flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800"><span>{notice}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
      {loading ? <div role="status" className="rounded-[32px] border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">Loading products…</div> : <AdminTable columns={columns} rows={products} emptyMessage="No products found." />}
      {pagination.pages > 1 && <nav aria-label="Products pagination" className="flex justify-end gap-3"><Button variant="outline" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</Button><span className="self-center text-sm">Page {pagination.page} of {pagination.pages}</span><Button variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => load(pagination.page + 1)}>Next</Button></nav>}
      {modal !== null && <ProductModal key={modal._id || "new"} product={modal._id ? modal : null} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}
