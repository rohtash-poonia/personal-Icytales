/**
 * EXAMPLE USAGE - How to use the new product mapping system
 *
 * This file shows how to implement the dynamic product mapping in your components
 */

// ============================================
// EXAMPLE 1: Using in ProductDetails Component
// ============================================

import { useSearchParams } from "next/navigation";
import { getProductDetailsWithHomeInfo } from "@/data/productUtils";

export function ProductDetailsPage() {
  const searchParams = useSearchParams();
  const productId = parseInt(searchParams.get("id")) || 1;

  // Get product with home info merged
  const product = getProductDetailsWithHomeInfo(productId);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price}</p>
      <p>Rating: {product.rating}</p>
      <p>Category: {product.category}</p>
      <p>Type: {product.homeProductInfo.type}</p>
      {product.homeProductInfo.discount && (
        <p>Discount: {product.homeProductInfo.discount}</p>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 2: Filtering Favourite Products
// ============================================

import { getFavouriteProductsWithDetails } from "@/data/productUtils";

export function FavouriteProductsSection() {
  const favouriteProducts = getFavouriteProductsWithDetails();

  return (
    <div>
      <h2>Favourite Products</h2>
      {favouriteProducts.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price}</p>
          <p>Rating: {product.homeProductInfo.ratings}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 3: Filtering Best Sellers
// ============================================

import { getBestSellerProductsWithDetails } from "@/data/productUtils";

export function BestSellerSection() {
  const bestSellers = getBestSellerProductsWithDetails();

  return (
    <div>
      <h2>Best Sellers</h2>
      {bestSellers.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 4: Filtering by Category
// ============================================

import { getProductsByCategory, getAllCategories } from "@/data/productUtils";

export function CategoryFilter() {
  const categories = getAllCategories();

  return (
    <div>
      {categories.map((category) => {
        const products = getProductsByCategory(category);
        return (
          <div key={category}>
            <h3>{category}</h3>
            {products.map((product) => (
              <div key={product.id}>
                <p>{product.name}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// EXAMPLE 5: Search Products
// ============================================

import { searchProductsByName } from "@/data/productUtils";
import { useState } from "react";

export function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const results = searchProductsByName(searchTerm);

  return (
    <div>
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {results.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 6: Related Products in Detail Page
// ============================================

import { getRelatedProducts } from "@/data/productUtils";

export function RelatedProductsSection({ productId }) {
  const relatedProducts = getRelatedProducts(productId, 4);

  return (
    <div>
      <h2>Related Products</h2>
      <div className="grid grid-cols-4">
        {relatedProducts.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Get All Products (Filtered)
// ============================================

import { getFilteredProductsWithDetails } from "@/data/productUtils";

export function AllProducts() {
  // Get all products with details
  const allProducts = getFilteredProductsWithDetails("all");

  return (
    <div>
      <h2>All Products</h2>
      <div className="grid grid-cols-4">
        {allProducts.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <p>Category: {product.category}</p>
            <p>Type: {product.homeProductInfo.type}</p>
            {product.homeProductInfo.discount && (
              <p className="text-red-500">{product.homeProductInfo.discount}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PROPERTY STRUCTURE
// ============================================

/*
PRODUCT OBJECT STRUCTURE:
{
  // From completeProductsData
  id: 1,
  name: "Product Name",
  price: "$5.49",
  rating: "4.3/5",
  description: "...",
  images: [...],
  colors: [...],
  sizes: [...],
  tabs: [...],
  category: "Sundaes",
  
  // Home Product Info (merged from homeProducts)
  homeProductInfo: {
    type: "favourite" | "bestSeller" | "discount",
    category: "Sundaes",
    ratings: "4.3",
    image: "/images/...",
    discount: "28% OFF",  // optional
    off: "$12.99"         // optional
  }
}
*/
