/** @format */

"use client";

/** @format */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import { BlogCategories } from "../common/Helper";

const BlogNav = () => {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";

  return (
    <nav aria-label="Blog categories" className="flex flex-wrap container gap-2 md:gap-7 justify-center mt-12 md:mt-33.5">
      {BlogCategories.map((category, index) => {
        const isActive = activeCategory === category.bloglink;
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', category.bloglink);
        params.set('page', '1');
        return (
          <Link
            key={index}
            href={`/blog?${params.toString()}`}
            className={`px-4 py-3 md:px-8 text-center items-center text-sm md:text-xl rounded-4xl duration-300 ${
              isActive ? "bg-[#F83D8E] text-white" : ""
            }`}>
            {category.bloglink}
          </Link>
        );
      })}
    </nav>
  );
};

export default BlogNav;
