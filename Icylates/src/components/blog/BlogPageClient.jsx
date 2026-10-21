"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BlogData, { blogEntries } from "@/components/blog/BlogData";
import BlogNav from "@/components/blog/BlogNav";
import BlogPaginations from "@/components/blog/BlogPaginations";

export default function BlogPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const category = searchParams.get("category") || "All";
  const columns = searchParams.get('layout') === 'list' ? 1 : searchParams.get('layout') === 'three' ? 3 : 2;
  const parsed = Number.parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 6;
  const filtered = blogEntries.filter((card) => category === "All" || card.category === category);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(Math.max(Number.isFinite(parsed) ? parsed : 1, 1), totalPages);
  const cards = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changePage(newPage) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`/blog?${params.toString()}`);
    });
  }

  return (
    <>
      <BlogNav />
      {isPending && <p role="status" className="py-4 text-center">Loading…</p>}
      <BlogData cards={cards} columns={columns} />
      {cards.length === 0 && <p className="py-12 text-center">No posts in this category.</p>}
      {totalPages > 1 && <BlogPaginations currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} />}
    </>
  );
}
