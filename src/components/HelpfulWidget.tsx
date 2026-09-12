"use client";

import { useState } from "react";

export default function HelpfulWidget() {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);

  return (
    <div className="mt-10 bg-white border border-gray-100 rounded-2xl p-6 text-center">
      <p className="font-bold text-gray-900">Bài viết này có hữu ích không?</p>
      <p className="text-sm text-gray-500 mt-1">Cho chúng tôi biết nếu bạn cần thêm thông tin.</p>
      {answer ? (
        <p className="mt-4 text-sm text-blue-700 font-semibold">Cảm ơn bạn đã phản hồi!</p>
      ) : (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAnswer("yes")}
            className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:border-blue-400 hover:text-blue-700 transition"
          >
            👍 Có
          </button>
          <button
            type="button"
            onClick={() => setAnswer("no")}
            className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:border-blue-400 hover:text-blue-700 transition"
          >
            👎 Không
          </button>
        </div>
      )}
    </div>
  );
}
