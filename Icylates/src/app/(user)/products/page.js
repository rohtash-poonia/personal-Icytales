"use client";

import React, { Suspense } from "react";

import CommonHero from "@/components/common/CommonHero";
import ClientRatings from "@/components/review/ClientRatings";
import Products from "@/components/shop/Products";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Products />
      </Suspense>
    </div>
  );
};

export default page;
