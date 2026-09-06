"use client";

import { useEffect, useRef, useState } from "react";

interface GamepadSnapshot {
  id: string;
  index: number;
  buttons: { pressed: boolean; value: number }[];
  axes: number[];
  hasVibration: boolean;
}

const BUTTON_LABELS: Record<number, string> = {
  0: "A / ✕",
  1: "B / ○",
  2: "X / □",
  3: "Y / △",
  4: "LB / L1",
  5: "RB / R1",
  6: "LT / L2",
  7: "RT / R2",
  8: "Select",
  9: "Start",
  10: "L3",
  11: "R3",
  12: "D-Up",
  13: "D-Down",
  14: "D-Left",
  15: "D-Right",
  16: "Home",
};

function readGamepads(): GamepadSnapshot[] {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const result: GamepadSnapshot[] = [];
  for (const pad of pads) {
    if (!pad) continue;
    result.push({
      id: pad.id,
      index: pad.index,
      buttons: pad.buttons.map((b) => ({ pressed: b.pressed, value: b.value })),
      axes: [...pad.axes],
      hasVibration: !!pad.vibrationActuator,
    });
  }
  return result;
}

function StickPad({ x, y, label }: { x: number; y: number; label: string }) {
  const clampedX = Math.max(-1, Math.min(1, x));
  const clampedY = Math.max(-1, Math.min(1, y));
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 rounded-full bg-gray-100 border border-gray-200">
        <div
          className="absolute w-6 h-6 rounded-full bg-blue-700 -translate-x-1/2 -translate-y-1/2 transition-[top,left] duration-75"
          style={{
            left: `${50 + clampedX * 38}%`,
            top: `${50 + clampedY * 38}%`,
          }}
        />
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function TriggerBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 transition-all" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

export default function GamepadTester() {
  const [gamepads, setGamepads] = useState<GamepadSnapshot[]>([]);
  const [supported, setSupported] = useState(true);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.getGamepads) {
      setSupported(false);
      return;
    }

    const loop = () => {
      setGamepads(readGamepads());
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const vibrate = (index: number) => {
    const pad = navigator.getGamepads()[index];
    const actuator = pad?.vibrationActuator;
    if (actuator) {
      actuator.playEffect("dual-rumble", {
        duration: 400,
        strongMagnitude: 1.0,
        weakMagnitude: 1.0,
      });
    }
  };

  if (!supported) {
    return (
      <p className="text-sm text-red-600 bg-red-50 rounded-xl p-4">
        Trình duyệt này không hỗ trợ Gamepad API. Hãy dùng Chrome, Edge hoặc Firefox bản mới.
      </p>
    );
  }

  if (gamepads.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl">
        <p className="text-4xl mb-3">🎮</p>
        <p className="text-gray-600 font-medium mb-1">Chưa phát hiện tay cầm nào</p>
        <p className="text-sm text-gray-400">
          Kết nối tay cầm qua USB hoặc Bluetooth, sau đó nhấn bất kỳ nút nào để trình duyệt nhận diện.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gamepads.map((pad) => (
        <div key={pad.index} className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-xs text-gray-400">Cổng #{pad.index}</p>
              <h3 className="font-semibold text-gray-800">{pad.id}</h3>
            </div>
            {pad.hasVibration && (
              <button
                onClick={() => vibrate(pad.index)}
                className="text-sm font-semibold bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
              >
                📳 Test rung
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Nút bấm</h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {pad.buttons.map((b, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center rounded-lg py-2 text-[11px] font-medium border transition ${
                      b.pressed
                        ? "bg-blue-700 text-white border-blue-700"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    <span>{BUTTON_LABELS[i] ?? i}</span>
                  </div>
                ))}
              </div>

              {(pad.buttons[6] || pad.buttons[7]) && (
                <div className="flex gap-4 mt-4">
                  {pad.buttons[6] && <TriggerBar value={pad.buttons[6].value} label="LT / L2" />}
                  {pad.buttons[7] && <TriggerBar value={pad.buttons[7].value} label="RT / R2" />}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Joystick</h4>
              <div className="flex gap-6 justify-center">
                <StickPad x={pad.axes[0] ?? 0} y={pad.axes[1] ?? 0} label="Trái" />
                <StickPad x={pad.axes[2] ?? 0} y={pad.axes[3] ?? 0} label="Phải" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
