import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";
import GamepadTester from "@/components/GamepadTester";

export const metadata: Metadata = {
  title: "Kiểm tra tay cầm",
  description: "Kiểm tra nút bấm, joystick và độ rung của tay cầm gaming ngay trên trình duyệt, không cần cài phần mềm.",
};

export default function GamepadTestPage() {
  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="compact" showNav navActive="gamepad-test" />
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Kiểm tra tay cầm" }]} />

      <section className="max-w-5xl mx-auto px-4 pb-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-700 p-6 lg:p-8 text-white mb-6">
          <h1 className="text-xl lg:text-2xl font-black mb-2">Kiểm tra tay cầm</h1>
          <p className="text-blue-100 text-sm max-w-2xl">
            Kết nối tay cầm qua USB hoặc Bluetooth để kiểm tra nút bấm, joystick và độ rung ngay trên trình duyệt — không cần cài phần mềm.
          </p>
        </div>

        <GamepadTester />
      </section>

      <Footer variant="condensed" />
      <MobileBottomNav active="products" />
      <div className="h-16 md:hidden" />
    </>
  );
}
