"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function CountdownTimer() {
  const [seconds, setSeconds] = useState(3 * 3600 + 24 * 60 + 15);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <div className="flex items-center gap-1.5">
      {[h, m, s].map((val, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="bg-gray-900 text-white text-sm font-bold rounded-md px-2 py-1 min-w-[2rem] text-center">
            {pad(val)}
          </span>
          {i < 2 && <span className="text-gray-400 font-bold">:</span>}
        </span>
      ))}
    </div>
  );
}
