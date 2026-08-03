import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TAYCAMHANOI - Chuyên Tay Cầm & Phụ Kiện Gaming Chính Hãng",
  description:
    "TAYCAMHANOI - Chuyên cung cấp tay cầm gaming chính hãng Gamesir, Flydigi, Aolion, Xbox, PlayStation. Freeship toàn quốc, bảo hành 12 tháng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} bg-gray-50 font-sans antialiased`}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
