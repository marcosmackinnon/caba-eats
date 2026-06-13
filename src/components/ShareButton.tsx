"use client";

import { useState } from "react";

import { logRestaurantInteraction } from "@/lib/supabase/events";

export default function ShareButton({
  title,
  text,
  url,
  label = "Compartir",
  restaurantSlug,
  primary = false,
}: {
  title: string;
  text: string;
  url?: string;
  label?: string;
  restaurantSlug?: string;
  primary?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  async function handleShare() {
    const shareUrl = url
      ? new URL(url, window.location.origin).toString()
      : window.location.href;
    const fallbackText = text ? `${text}\n${shareUrl}` : shareUrl;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fallbackText);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      window.prompt("Copiá este link", fallbackText);
    }

    if (restaurantSlug) {
      void logRestaurantInteraction({ restaurantSlug, action: "shared" });
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        primary
          ? "inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#f27a3f] px-5 py-3 text-base font-semibold text-white shadow-[0_16px_35px_rgba(242,122,63,0.28)] transition hover:-translate-y-0.5"
          : "inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#e8d6c8] bg-white px-5 py-3 text-base font-semibold text-stone-700 transition hover:bg-[#fff8f2]"
      }
    >
      {status === "copied" ? "✓ Link copiado" : label}
    </button>
  );
}
