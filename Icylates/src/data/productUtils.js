/**
 * Product Filtering & Matching Utilities
 * Match homeProducts from Helper.js with detailed product data
 */

import { homeProducts } from "../components/common/Helper";
import { completeProductsData, getProductById } from "./productMapping";

/**
 * Get matching product details by matching ID with homeProducts
 * @param {number} productId - The product ID to match
 * @returns {object} - Complete product data with home product info merged
 */
export const getProductDetailsWithHomeInfo = (productId) => {
  const homeProduct = homeProducts.find((item) => item.id === productId);
  const detailedProduct = getProductById(productId);

  if (!homeProduct || !detailedProduct) {
    return null;
  }

  // Merge home product info with detailed product data
  return {
    ...detailedProduct,
    ...homeProduct,
    // Keep homeProducts specific fields
    homeProductInfo: {
      type: homeProduct.type,
      category: homeProduct.category,
      ratings: homeProduct.ratings,
      image: homeProduct.image,
      discount: homeProduct.discount,
      off: homeProduct.off,
    },
  };
};

/**
 * Filter home products and return with full details matching by ID
 * @param {string} filterType - Filter by type: 'favourite', 'bestSeller', 'discount', or 'all'
 * @returns {array} - Array of products with complete details
 */
export const getFilteredProductsWithDetails = (filterType = "all") => {
  let filtered = homeProducts;

  if (filterType !== "all") {
    filtered = homeProducts.filter((item) => item.type === filterType);
  }

  // Match with detailed product data by ID
  return filtered
    .map((homeProduct) => {
      const detailedProduct = getProductById(homeProduct.id);
      return detailedProduct
        ? {
            ...detailedProduct,
            homeProductInfo: {
              type: homeProduct.type,
              category: homeProduct.category,
              ratings: homeProduct.ratings,
              image: homeProduct.image,
              discount: homeProduct.discount,
              off: homeProduct.off,
            },
          }
        : null;
    })
    .filter((item) => item !== null);
};

/**
 * Get all favourite products with details
 * @returns {array}
 */
export const getFavouriteProductsWithDetails = () => {
  return getFilteredProductsWithDetails("favourite");
};

/**
 * Get all best seller products with details
 * @returns {array}
 */
export const getBestSellerProductsWithDetails = () => {
  return getFilteredProductsWithDetails("bestSeller");
};

/**
 * Get all discount products with details
 * @returns {array}
 */
export const getDiscountProductsWithDetails = () => {
  return getFilteredProductsWithDetails("discount");
};

/**
 * Filter products by category
 * @param {string} category - Category name
 * @returns {array} - Products in that category with full details
 */
export const getProductsByCategory = (category) => {
  return homeProducts
    .filter((item) => item.category === category)
    .map((homeProduct) => {
      const detailedProduct = getProductById(homeProduct.id);
      return detailedProduct
        ? {
            ...detailedProduct,
            homeProductInfo: {
              type: homeProduct.type,
              category: homeProduct.category,
              ratings: homeProduct.ratings,
              image: homeProduct.image,
              discount: homeProduct.discount,
              off: homeProduct.off,
            },
          }
        : null;
    })
    .filter((item) => item !== null);
};

/**
 * Get all unique categories from home products
 * @returns {array}
 */
export const getAllCategories = () => {
  const categories = new Set(homeProducts.map((item) => item.category));
  return Array.from(categories);
};

/**
 * Get all unique product types
 * @returns {array}
 */
export const getAllProductTypes = () => {
  const types = new Set(homeProducts.map((item) => item.type));
  return Array.from(types);
};

/**
 * Search products by name
 * @param {string} searchTerm - Search term
 * @returns {array}
 */
export const searchProductsByName = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return getFilteredProductsWithDetails("all").filter((product) =>
    product.name.toLowerCase().includes(term),
  );
};

/**
 * Get related products (same category or type)
 * @param {number} productId - Current product ID
 * @param {number} limit - Number of related products to return
 * @returns {array}
 */
export const getRelatedProducts = (productId, limit = 4) => {
  const currentProduct = getProductDetailsWithHomeInfo(productId);

  if (!currentProduct) return [];

  return getFilteredProductsWithDetails("all")
    .filter(
      (product) =>
        product.id !== productId &&
        (product.category === currentProduct.category ||
          product.homeProductInfo.type === currentProduct.homeProductInfo.type),
    )
    .slice(0, limit);
};
