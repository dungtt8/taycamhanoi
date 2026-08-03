"use client";

import Link from "next/link";
import { HomeIcon, GridIcon, CartIcon, UserIcon } from "./icons";
import { useCart } from "@/lib/cart-context";

export type MobileNavTab = "home" | "products" | "cart" | "account";

const TABS: { key: MobileNavTab; label: string; href: string; icon: typeof HomeIcon }[] = [
  { key: "home", label: "Trang chủ", href: "/", icon: HomeIcon },
  { key: "products", label: "Sản phẩm", href: "/san-pham", icon: GridIcon },
  { key: "cart", label: "Giỏ hàng", href: "#cart", icon: CartIcon },
  { key: "account", label: "Tài khoản", href: "#", icon: UserIcon },
];

export default function MobileBottomNav({ active }: { active: MobileNavTab }) {
  const { itemCount, openDrawer } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-2 z-40">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === active;
        const isCart = tab.key === "cart";
        const content = (
          <div
            className={`flex flex-col items-center px-3 py-1 relative ${
              isActive ? "text-blue-700" : "text-gray-500"
            }`}
          >
            <Icon className="w-5 h-5" />
            {isCart && itemCount > 0 && (
              <span className="absolute -top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </div>
        );

        if (isCart) {
          return (
            <button key={tab.key} onClick={openDrawer}>
              {content}
            </button>
          );
        }

        return (
          <Link key={tab.key} href={tab.href}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
