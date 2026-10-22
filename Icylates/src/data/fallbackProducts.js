const products = [
  [
    "Chocolate Brownie Sundae",
    5.49,
    "Sundaes",
    "Chocolate",
    "Rich chocolate ice cream with chunks of brownie.",
    "4831f",
  ],
  [
    "Strawberry Shortcake",
    5.29,
    "Sundaes",
    "Strawberry",
    "Strawberry ice cream layered with shortcake.",
    "8baa0",
  ],
  [
    "Mint Chocolate Chip Cone",
    3.99,
    "Cones",
    "Mint",
    "Refreshing mint ice cream with chocolate chips.",
    "c8aaa",
  ],
  [
    "Classic Vanilla Ice Cream",
    4.99,
    "Cones",
    "Vanilla",
    "Creamy vanilla ice cream topped with cherry.",
    "b874d",
  ],
  [
    "Chocolate Chip Cookie Cone",
    4.49,
    "Cones",
    "Cookie dough",
    "Chocolate chip cookie dough ice cream in a cone.",
    "1cc89",
  ],
  [
    "Rocky Road Sundae",
    5.69,
    "Sundaes",
    "Rocky road",
    "Marshmallow and nutty rocky road ice cream.",
    "7b9ad",
  ],
  [
    "Peach Melba Sundae",
    5.39,
    "Sundaes",
    "Peach",
    "Peach ice cream topped with raspberry sauce.",
    "5a3b8",
  ],
  [
    "Strawberry Sundae",
    5.99,
    "Sundaes",
    "Strawberry",
    "Strawberry ice cream with fresh strawberries.",
    "efb6e",
  ],
  [
    "Coconut Milk Chocolate Chip",
    5.99,
    "Vegan",
    "Coconut chocolate chip",
    "Coconut Milk Chocolate Chip",
    "ae3af",
  ],
  ["Almond Joy Sundae", 6.49, "Vegan", "Almond", "Almond Joy Sundae", "de89b"],
  ["Berry Sorbet", 4.89, "Vegan", "Berry", "Berry Sorbet", "48389"],
  ["Chocolate Fudge", 5.99, "Vegan", "Chocolate", "Chocolate Fudge", "62343"],
  ["Dairy Free Classic", 6.49, "Vegan", "", "Dairy Free Classic", "9b0cc"],
  ["Dairy Free Almond", 4.89, "Vegan", "Almond", "Dairy Free Almond", "158e8"],
  [
    "Classic Pistachio Gelato",
    6.29,
    "Gelato",
    "Pistachio",
    "Classic Pistachio Gelato",
    "e7a22",
  ],
  [
    "Strawberry Balsamic Gelato",
    6.49,
    "Gelato",
    "Strawberry balsamic",
    "Strawberry Balsamic Gelato",
    "407d1",
  ],
  [
    "Chocolate Hazelnut Gelato",
    6.79,
    "Gelato",
    "Chocolate hazelnut",
    "Chocolate Hazelnut Gelato",
    "bb0d6",
  ],
  ["Tiramisu Gelato", 6.59, "Gelato", "Tiramisu", "Tiramisu Gelato", "0b3e2"],
].map(([title, price, category, flavor, description, image], index) => ({
  _id: `catalog-${index + 1}`,
  title,
  price,
  category,
  flavor,
  description,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  images: [
    { url: `/images/figma/original/${image}.png`, publicId: "", alt: title },
  ],
  tags: ["figma-demo"],
  stock: 25,
  status: "active",
  featured: index < 4,
  rating: 0,
  reviewCount: 0,
}));

export function getFallbackProduct(identifier) {
  return (
    products.find(
      (product) => product.slug === identifier || product._id === identifier,
    ) || null
  );
}

export function getFallbackProducts(filters = {}) {
  const search = String(filters.search || "")
    .trim()
    .toLowerCase();
  const category =
    filters.category && filters.category !== "all" ? filters.category : "";
  let items = products.filter((product) => {
    if (category && product.category !== category) return false;
    if (
      filters.featured !== undefined &&
      product.featured !==
        (filters.featured === true || filters.featured === "true")
    )
      return false;
    if (
      filters.minPrice !== undefined &&
      filters.minPrice !== "" &&
      product.price < Number(filters.minPrice)
    )
      return false;
    if (
      filters.maxPrice !== undefined &&
      filters.maxPrice !== "" &&
      product.price > Number(filters.maxPrice)
    )
      return false;
    return (
      !search ||
      [
        product.title,
        product.description,
        product.category,
        product.flavor,
        ...product.tags,
      ].some((value) => value.toLowerCase().includes(search))
    );
  });

  if (filters.sort === "price-asc")
    items = [...items].sort((a, b) => a.price - b.price);
  if (filters.sort === "price-desc")
    items = [...items].sort((a, b) => b.price - a.price);
  if (filters.sort === "title")
    items = [...items].sort((a, b) => a.title.localeCompare(b.title));

  const total = items.length;
  const limit = Math.max(1, Number(filters.limit) || 12);
  const page = Math.max(1, Number(filters.page) || 1);
  const categories = [...new Set(products.map((product) => product.category))]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
      count: products.filter((product) => product.category === name).length,
    }));

  return {
    items: items.slice((page - 1) * limit, page * limit),
    categories,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}
