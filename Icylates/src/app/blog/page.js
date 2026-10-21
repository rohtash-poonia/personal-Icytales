import React from "react";
import BlogPageClient from "@/components/blog/BlogPageClient";

const page = () => {
  return (
    <React.Suspense fallback={<p className="text-center py-4">Loading...</p>}>
      <BlogPageClient />
    </React.Suspense>
  );
};

export default page;
