"use client";

import { useState } from "react";

export default function ShareButton({
  title,
  text,
  url,
  label = "Compartir",
}: {
  title: string;
  text: string;
  url?: string;
  label?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  async function handleShare() {
    const shareUrl = url
      ? new URL(url, window.location.origin).toString()
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      window.prompt("Copiá este link", shareUrl);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-full border border-[#e8d6c8] bg-white px-5 py-3 text-base font-semibold text-stone-700 transition hover:bg-[#fff8f2]"
    >
      {status === "copied" ? "Link copiado" : label}
    </button>
  );
}
