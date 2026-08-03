"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitted");
  };

  if (status === "submitted") {
    return (
      <p className="text-white font-semibold bg-white/20 rounded-xl px-4 py-3 text-center">
        Cảm ơn bạn đã đăng ký! Ưu đãi sẽ được gửi tới email của bạn.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        required
        placeholder="Nhập email của bạn"
        className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none"
      />
      <button
        type="submit"
        className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition"
      >
        Đăng ký ngay
      </button>
    </form>
  );
}
