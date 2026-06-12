"use client";

import { useEffect, useState } from "react";

type ToastItem = {
  id: number;
  message: string;
  type: "success" | "error";
};

let listeners: ((item: ToastItem) => void)[] = [];
let counter = 0;

export function showToast(message: string, type: "success" | "error" = "success") {
  const item: ToastItem = { id: ++counter, message, type };
  listeners.forEach((fn) => fn(item));
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setToasts((prev) => [...prev, item]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, 3500);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-4 z-[100] flex flex-col gap-2 md:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all animate-in slide-in-from-left-4 duration-300 ${
            t.type === "success"
              ? "bg-stone-900"
              : "bg-red-600"
          }`}
        >
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
