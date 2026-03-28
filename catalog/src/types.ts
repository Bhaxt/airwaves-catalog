export interface Variant {
  id: string;
  name: string;
  price: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  brand?: string;
  category: string;
  categoryName: string;
  description: string;
  images: string[];
  variants: Variant[];
  sourceUrl?: string;
}

export const CATEGORIES: { slug: string; name: string }[] = [
  { slug: "electronic",  name: "Electronic Products" },
  { slug: "perfume",     name: "Perfume" },
  { slug: "apparel",     name: "Apparel" },
  { slug: "shoes",       name: "Shoes" },
  { slug: "accessories", name: "Apparel Accessories" },
  { slug: "bags",        name: "Bags" },
  { slug: "toys",        name: "Toys" },
  { slug: "watches",     name: "Watches" },
  { slug: "jersey",      name: "Jersey" },
];
