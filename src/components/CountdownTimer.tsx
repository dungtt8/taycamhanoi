"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function secondsUntil(endTime?: string | null) {
  if (!endTime) return 3 * 3600 + 24 * 60 + 15;
  const diff = Math.floor((new Date(endTime).getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
}

export default function CountdownTimer({ endTime }: { endTime?: string | null }) {
  const [seconds, setSeconds] = useState(() => secondsUntil(endTime));

  useEffect(() => {
    setSeconds(secondsUntil(endTime));
    const id = setInterval(() => {
      setSeconds(secondsUntil(endTime));
    }, 1000);
    return () => clearInterval(id);
  }, [endTime]);

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
