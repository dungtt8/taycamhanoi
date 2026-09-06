import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Đặt hàng thành công",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <>
      <Header variant="minimal" checkoutStep="success" />
      <section className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h1>
        {order && (
          <p className="text-sm text-gray-600 mb-2">
            Mã đơn hàng: <span className="font-bold text-gray-900">#{order}</span>
          </p>
        )}
        <p className="text-gray-500 mb-8">
          Cảm ơn bạn đã mua sắm tại TAYCAMHANOI. Đơn hàng của bạn đang được xử lý, chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition">
            Về trang chủ
          </Link>
          <Link href="/san-pham" className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:border-blue-400 transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
      <Footer variant="minimal" />
    </>
  );
}
