"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { TrashIcon } from "./icons";

type ShippingMethod = "standard" | "fast" | "express";
type PaymentMethod = "cod" | "vietqr" | "vnpay";

const SHIPPING_OPTIONS: { key: ShippingMethod; label: string; price: number; description: string }[] = [
  { key: "standard", label: "Tiêu chuẩn", price: 0, description: "Giao trong 3-5 ngày, miễn phí" },
  { key: "fast", label: "Nhanh", price: 25000, description: "Giao trong 1-2 ngày" },
  { key: "express", label: "Hỏa tốc", price: 45000, description: "Giao trong ngày (nội thành)" },
];

const VOUCHERS: Record<string, number> = {
  TAYCAM50: 50000,
  FREESHIP: 25000,
};

export default function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, removeItem, clearCart } = useCart();
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherApplied, setVoucherApplied] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState("");

  const shippingFee = SHIPPING_OPTIONS.find((s) => s.key === shipping)?.price ?? 0;
  const voucherDiscount = voucherApplied ? VOUCHERS[voucherApplied] ?? 0 : 0;
  const total = Math.max(0, subtotal + shippingFee - voucherDiscount);

  const [orderCode, setOrderCode] = useState("");
  useEffect(() => {
    setOrderCode(`TCH${Date.now().toString().slice(-8)}`);
  }, []);

  const applyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (VOUCHERS[code]) {
      setVoucherApplied(code);
      setVoucherError("");
    } else {
      setVoucherError("Mã giảm giá không hợp lệ");
      setVoucherApplied(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    router.push("/dat-hang-thanh-cong");
  };

  if (items.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống.</p>
        <Link href="/san-pham" className="text-blue-700 font-semibold hover:underline">
          Tiếp tục mua sắm →
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5">
          {/* Shipping info */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-bold text-gray-800">Thông tin giao hàng</h2>
              <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Mua không cần tài khoản
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Họ và tên" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:col-span-1" />
              <input required placeholder="Số điện thoại" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:col-span-1" />
              <input required type="email" placeholder="Email" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:col-span-2" />
              <input required placeholder="Địa chỉ" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:col-span-2" />
              <select required defaultValue="" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm">
                <option value="" disabled>Tỉnh/Thành phố</option>
                <option>Hà Nội</option>
                <option>TP. Hồ Chí Minh</option>
                <option>Đà Nẵng</option>
              </select>
              <select required defaultValue="" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm">
                <option value="" disabled>Quận/Huyện</option>
                <option>Quận khác</option>
              </select>
              <textarea placeholder="Ghi chú giao hàng (không bắt buộc)" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:col-span-2" rows={2} />
            </div>
          </div>

          {/* Shipping method */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-bold text-gray-800">Phương thức vận chuyển</h2>
            </div>
            <div className="space-y-2">
              {SHIPPING_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition ${
                    shipping === opt.key ? "border-blue-600 bg-blue-50/50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping === opt.key}
                    onChange={() => setShipping(opt.key)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.description}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {opt.price === 0 ? "Miễn phí" : `+${formatPrice(opt.price)}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="font-bold text-gray-800">Phương thức thanh toán</h2>
            </div>
            <div className="space-y-2">
              {[
                { key: "cod" as PaymentMethod, label: "Thanh toán khi nhận hàng (COD)", description: "Trả tiền mặt khi nhận hàng" },
                { key: "vietqr" as PaymentMethod, label: "VietQR", description: "Quét mã QR chuyển khoản tự động" },
                { key: "vnpay" as PaymentMethod, label: "VNPay", description: "Cổng thanh toán qua 40+ ngân hàng" },
              ].map((opt) => (
                <div key={opt.key}>
                  <label
                    className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition ${
                      payment === opt.key ? "border-blue-600 bg-blue-50/50" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === opt.key}
                      onChange={() => setPayment(opt.key)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.description}</p>
                    </div>
                  </label>
                  {opt.key === "vietqr" && payment === "vietqr" && (
                    <div className="mt-2 ml-8 border border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/40 text-sm text-gray-600 flex items-center gap-4">
                      <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-3xl">
                        📱
                      </div>
                      <div>
                        <p>Ngân hàng: Vietcombank</p>
                        <p>Số TK: 0123456789 — TAYCAMHANOI</p>
                        <p>Nội dung: {orderCode}</p>
                        <p className="font-bold text-red-600">{formatPrice(total)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variant ?? ""}`} className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br ${item.colorFrom} ${item.colorTo}`}>
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {item.variant ? `${item.variant} • ` : ""}SL: {item.qty}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{formatPrice(item.price * item.qty)}</span>
                  <button type="button" onClick={() => removeItem(item.productId, item.variant)} className="text-gray-300 hover:text-red-500">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                placeholder="Mã giảm giá"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={applyVoucher}
                className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900"
              >
                Áp dụng
              </button>
            </div>
            {voucherError && <p className="text-xs text-red-500 -mt-3 mb-3">{voucherError}</p>}
            {voucherApplied && (
              <p className="text-xs text-green-600 -mt-3 mb-3">
                Đã áp dụng mã {voucherApplied}: -{formatPrice(voucherDiscount)}
              </p>
            )}

            <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá voucher</span>
                  <span>-{formatPrice(voucherDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-100 pt-2">
                <span>Tổng cộng</span>
                <span className="text-red-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl mt-4 transition shadow-lg shadow-red-500/30"
            >
              ĐẶT HÀNG NGAY
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              Bằng việc đặt hàng, bạn đồng ý với Điều khoản dịch vụ của TAYCAMHANOI.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-sm text-gray-600 mb-2">Cần hỗ trợ?</p>
            <div className="flex gap-2 justify-center">
              <a href="tel:090xxxxxxx" className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-semibold text-gray-700">
                📞 Gọi ngay
              </a>
              <a href="#" className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-semibold text-gray-700">
                💬 Chat Zalo
              </a>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
