export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  price: number;
  variant?: string;
  qty: number;
}
