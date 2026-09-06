import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Thanh toán",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="minimal" checkoutStep="checkout" />
      <CheckoutForm />
      <Footer variant="minimal" />
    </>
  );
}
