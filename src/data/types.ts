// Shared TypeScript types for TAYCAMHANOI mock/sample content.
// These types describe the shape of the static data under src/data/*
// that page components import while the real backend/CMS is not wired up yet.

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  seriesTag?: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  badge?: string;
  ribbon?: string;
  rating: number;
  ratingCount: number;
  soldCount: number;
  stock: number;
  variants?: ProductVariant[];
  comboItems?: ComboItem[];
  description: string;
  specs: Record<string, string>;
  images?: string[];
}

export interface ProductVariant {
  name: string;
  colorHex: string;
}

export interface ComboItem {
  name: string;
  price: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  productCount: number;
  description: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string;
  productCount: number;
  rating: number;
  warrantyYears: number;
  foundedYear: number;
  origin: string;
  certification: string;
  keyTech: string;
  series: BrandSeries[];
}

export interface BrandSeries {
  name: string;
  tier: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  verified: boolean;
  date: string;
  text: string;
  variantTag?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  tag: string;
  readTime: string;
  views: string;
  excerpt: string;
}
