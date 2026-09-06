export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug?: string;
  hasBrandPage: boolean;
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
  imageUrl?: string;
  categoryName?: string;
  stockStatus?: "instock" | "outofstock" | "onbackorder";
  descriptionHtml?: string;
  policyNoteHtml?: string;
  shopeeLink?: string;
}

export interface ProductVariant {
  name: string;
  colorHex: string;
}

export interface ComboItem {
  name: string;
  price: number;
}
