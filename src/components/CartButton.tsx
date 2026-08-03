"use client";

import { useCart } from "@/lib/cart-context";
import { CartIcon } from "./icons";

export default function CartButton() {
  const { itemCount, openDrawer } = useCart();

  return (
    <button
      onClick={openDrawer}
      className="flex flex-col items-center text-gray-600 hover:text-blue-700 transition relative"
    >
      <CartIcon />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
      <span className="text-[10px] mt-0.5">Giỏ hàng</span>
    </button>
  );
}
