"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { CloseIcon, TrashIcon, CartIcon } from "./icons";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQty, subtotal } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl transition-transform flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <CartIcon className="w-5 h-5" /> Giỏ hàng ({items.length})
          </h2>
          <button onClick={closeDrawer} className="text-gray-500 hover:text-gray-800">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-10">Giỏ hàng của bạn đang trống.</p>
          )}
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variant ?? ""}`}
              className="flex items-center gap-3 border border-gray-100 rounded-lg p-2"
            >
              <div
                className={`w-14 h-14 rounded-lg overflow-hidden relative flex items-center justify-center text-2xl bg-gradient-to-br ${item.colorFrom} ${item.colorTo}`}
              >
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                ) : (
                  item.emoji
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</p>
                {item.variant && <p className="text-xs text-gray-500">Phân loại: {item.variant}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => updateQty(item.productId, item.variant, item.qty - 1)}
                    className="w-6 h-6 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="text-sm w-5 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.variant, item.qty + 1)}
                    className="w-6 h-6 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold text-red-600">{formatPrice(item.price * item.qty)}</span>
                <button
                  onClick={() => removeItem(item.productId, item.variant)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tạm tính</span>
            <span className="font-bold text-lg text-red-600">{formatPrice(subtotal)}</span>
          </div>
          <Link
            href="/thanh-toan"
            onClick={closeDrawer}
            className={`block text-center font-bold py-3 rounded-xl transition ${
              items.length === 0
                ? "bg-gray-200 text-gray-400 pointer-events-none"
                : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
            }`}
          >
            Tiến hành thanh toán
          </Link>
        </div>
      </aside>
    </>
  );
}
