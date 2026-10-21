/** @format */
"use client";
import React from "react";
import { ForwardArrowIcon, PrevArrowIcon } from "../common/Icons";

const BlogPaginations = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-2 justify-center py-6">
      <button
        onClick={handlePrevious}
        className="p-2 hover:opacity-70 transition cursor-pointer"
        disabled={currentPage === 1}>
        <PrevArrowIcon />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded text-sm leading-xl transition cursor-pointer ${
            currentPage === page
              ? "bg-pink-500 text-white font-semibold"
              : "hover:bg-gray-200"
          }`}>
          {page}
        </button>
      ))}

      <button
        onClick={handleNext}
        className="p-2 hover:opacity-70 transition cursor-pointer"
        disabled={currentPage === totalPages}>
        <ForwardArrowIcon />
      </button>
    </div>
  );
};

export default BlogPaginations;
