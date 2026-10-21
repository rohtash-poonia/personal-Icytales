"use client";

import { useEffect, useRef, useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import SafeImage from "../common/SafeImage";

function imageRecord(image) {
  if (typeof image === "string") return { url: image, publicId: null, alt: "" };
  return { url: image?.url || "", publicId: image?.publicId || null, alt: image?.alt || "" };
}
function initial(product) {
  return {
    title: product?.title || "", slug: product?.slug || "", description: product?.description || "",
    price: product?.price ?? "", category: product?.category || "", flavor: product?.flavor || "",
    stock: product?.stock ?? 0, status: product?.status || "draft",
    images: Array.isArray(product?.images) ? product.images.map(imageRecord).filter((image) => image.url) : [],
    tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "", featured: Boolean(product?.featured),
  };
}

export default function ProductModal({ onClose, onSave, product }) {
  const [form, setForm] = useState(() => initial(product));
  const [newImages, setNewImages] = useState([]);
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const previewsRef = useRef([]);
  const savingRef = useRef(false);

  useEffect(() => { previewsRef.current = newImages; }, [newImages]);
  useEffect(() => { savingRef.current = saving; }, [saving]);
  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    function keydown(event) {
      if (event.key === "Escape" && !savingRef.current) onClose();
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll("button, input, select, textarea")].filter((node) => !node.disabled);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus?.();
    };
  }, [onClose]);
  useEffect(() => () => previewsRef.current.forEach((image) => URL.revokeObjectURL(image.preview)), []);

  function change(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: type === "checkbox" ? checked : value };
      if (name === "title" && !slugEdited) next.slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return next;
    });
    if (name === "slug") setSlugEdited(true);
  }

  function selectImages(event) {
    const files = [...(event.target.files || [])];
    event.target.value = "";
    if (!files.length) return;
    const invalid = files.find((file) => !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024);
    if (invalid) { setError(invalid.name + " must be a PNG, JPEG, WEBP or GIF no larger than 5 MB."); return; }
    if (form.images.length + newImages.length + files.length > 10) { setError("A product can have at most 10 images."); return; }
    setError("");
    setNewImages((current) => [...current, ...files.map((file, index) => ({
      id: [file.name, file.size, file.lastModified, index].join("-"), file, preview: URL.createObjectURL(file), alt: "",
    }))]);
  }

  function removeNew(id) {
    setNewImages((current) => current.filter((image) => {
      if (image.id === id) URL.revokeObjectURL(image.preview);
      return image.id !== id;
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setProgress(0); setError("");
    try {
      await onSave({
        title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim(),
        price: Number(form.price), category: form.category.trim(), flavor: form.flavor.trim(),
        stock: Number(form.stock), status: form.status, images: form.images,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean), featured: form.featured,
        ...(newImages.length ? { newImageAlts: newImages.map((image) => image.alt.trim()) } : {}),
      }, newImages.map((image) => image.file), setProgress);
    } catch (saveError) { setError(saveError?.message || "The product could not be saved."); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#210d2c]/60 p-3 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-pink/10 bg-linear-to-r from-[#fff5fa] to-[#f7f2fb] px-5 py-4 sm:px-8 sm:py-6">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-pink">Catalog studio</p><h2 id="product-dialog-title" className="berkshire text-3xl text-darkbrown">{product ? "Edit Product" : "Add New Product"}</h2></div>
          <button ref={closeRef} type="button" disabled={saving} onClick={onClose} aria-label="Close product form" className="rounded-full p-2 text-2xl text-slate-500 hover:bg-white">x</button>
        </div>
        <form onSubmit={submit} className="max-h-[78vh] overflow-y-auto p-5 sm:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Product Title" name="title" value={form.title} onChange={change} required maxLength={160} />
            <Input label="Slug" name="slug" value={form.slug} onChange={change} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={180} />
            <label className="flex flex-col gap-2 md:col-span-2"><span className="font-medium text-lightbrown">Description</span><textarea name="description" value={form.description} onChange={change} required maxLength={10000} rows={4} className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-pink focus:ring-2 focus:ring-pink/20" /></label>
            <Input label="Price (USD)" name="price" type="number" min="0.01" max="1000000" step="0.01" value={form.price} onChange={change} required />
            <Input label="Stock" name="stock" type="number" min="0" max="1000000" step="1" value={form.stock} onChange={change} required />
            <Input label="Category" name="category" value={form.category} onChange={change} required maxLength={100} />
            <Input label="Flavor" name="flavor" value={form.flavor} onChange={change} maxLength={100} />
            <Input label="Status" name="status" type="select" value={form.status} onChange={change} options={[{label:"Draft",value:"draft"},{label:"Active",value:"active"},{label:"Archived",value:"archived"}]} required />
            <Input label="Tags (comma separated)" name="tags" value={form.tags} onChange={change} maxLength={1000} />
            <label className="flex items-center gap-3 text-sm text-slate-700"><input name="featured" type="checkbox" checked={form.featured} onChange={change} /> Featured product</label>
          </div>
          <fieldset className="mt-7">
            <legend className="mb-3 font-semibold text-slate-800">Product images</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {form.images.map((image, index) => (
                <div key={image.publicId || image.url} className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
                  <div className="relative h-28 overflow-hidden rounded-xl bg-white">
                    <SafeImage src={image.url} alt={image.alt || "Product image " + (index + 1)} fill sizes="140px" className="object-contain" />
                    <button type="button" aria-label={"Remove " + (image.alt || "image " + (index + 1))} onClick={() => setForm((current) => ({...current, images:current.images.filter((_, i) => i !== index)}))} className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-0.5 text-white">x</button>
                  </div>
                  <input aria-label={"Alt text for image " + (index + 1)} value={image.alt} maxLength={200} placeholder="Alt text" onChange={(event) => setForm((current) => ({...current, images:current.images.map((value, i) => i === index ? {...value, alt:event.target.value} : value)}))} className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs" />
                </div>
              ))}
              {newImages.map((image) => (
                <div key={image.id} className="rounded-2xl border border-pink/20 bg-[#fff5fa] p-2">
                  <div className="relative h-28 overflow-hidden rounded-xl bg-white">
                    <SafeImage src={image.preview} alt={"Preview of " + image.file.name} fill unoptimized sizes="140px" className="object-contain" />
                    <button type="button" aria-label={"Remove " + image.file.name} onClick={() => removeNew(image.id)} className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-0.5 text-white">x</button>
                  </div>
                  <p className="mt-2 truncate text-xs text-slate-600">{image.file.name}</p>
                  <input aria-label={"Alt text for " + image.file.name} value={image.alt} maxLength={200} placeholder="Alt text" onChange={(event) => setNewImages((current) => current.map((value) => value.id === image.id ? {...value, alt:event.target.value} : value))} className="mt-2 w-full rounded-lg border border-pink/20 px-2 py-1 text-xs" />
                </div>
              ))}
              {form.images.length + newImages.length < 10 && (
                <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink/40 bg-[#fff9fc] p-3 text-center text-sm font-semibold text-pink hover:bg-[#fff1f8]">
                  + Add images
                  <input aria-label="Add product images" type="file" multiple hidden disabled={saving} onChange={selectImages} accept="image/png,image/jpeg,image/webp,image/gif" />
                </label>
              )}
            </div>
            {newImages.length > 0 && <p className="mt-3 text-sm text-slate-600">{newImages.length} new {newImages.length === 1 ? "image" : "images"} selected</p>}
          </fieldset>
          {progress > 0 && <div className="mt-5" role="status"><div className="mb-1 flex justify-between text-sm"><span>Uploading {progress}%</span><span>{progress}/100</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-linear-to-r from-pink to-darkpurple transition-all" style={{width:progress + "%"}} /></div></div>}
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button theme="secondary" type="button" disabled={saving} onClick={onClose} className="min-h-11 px-7">Cancel</Button>
            <Button theme="primary" type="submit" loading={saving} className="min-h-11 px-8">{product ? "Update product" : "Create product"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
