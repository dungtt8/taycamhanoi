"use server";

import { createWooOrder, type WooOrderInput } from "./woocommerce";

export interface CreateOrderInput {
  billing: {
    name: string;
    phone: string;
    email: string;
    address: string;
    ward: string;
    city: string;
    note?: string;
  };
  shippingLabel: string;
  shippingFee: number;
  paymentMethod: "cod" | "vietqr" | "vnpay";
  items: { productId: string; quantity: number }[];
}

const PAYMENT_TITLES: Record<CreateOrderInput["paymentMethod"], string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  vietqr: "Chuyển khoản VietQR",
  vnpay: "VNPay",
};

const PAYMENT_METHOD_IDS: Record<CreateOrderInput["paymentMethod"], string> = {
  cod: "cod",
  vietqr: "bacs",
  vnpay: "vnpay",
};

export async function createOrderAction(input: CreateOrderInput) {
  const [firstName, ...rest] = input.billing.name.trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;

  const address = {
    first_name: firstName,
    last_name: lastName,
    address_1: `${input.billing.address}, ${input.billing.ward}`,
    city: input.billing.city,
    email: input.billing.email,
    phone: input.billing.phone,
  };

  const order: WooOrderInput = {
    payment_method: PAYMENT_METHOD_IDS[input.paymentMethod],
    payment_method_title: PAYMENT_TITLES[input.paymentMethod],
    set_paid: false,
    billing: address,
    shipping: address,
    line_items: input.items.map((item) => ({
      product_id: Number(item.productId),
      quantity: item.quantity,
    })),
    shipping_lines: [
      {
        method_title: input.shippingLabel,
        method_id: "flat_rate",
        total: String(input.shippingFee),
      },
    ],
    customer_note: input.billing.note,
  };

  const result = await createWooOrder(order);
  return { orderNumber: result.number, total: result.total };
}
