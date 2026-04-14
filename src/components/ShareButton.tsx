"use client";

import { useState } from "react";

import { logRestaurantInteraction } from "@/lib/supabase/events";

export default function ShareButton({
  title,
  text,
  url,
  label = "Compartir",
  restaurantSlug,
}: {
  title: string;
  text: string;
  url?: string;
  label?: string;
  restaurantSlug?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  async function handleShare() {
    const shareUrl = url
      ? new URL(url, window.location.origin).toString()
      : window.location.href;
    const fallbackText = text ? `${text}\n${shareUrl}` : shareUrl;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        return;
      } catch {
        // Si falla o se cancela, seguimos con copiar link para que no sea un botón muerto.
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
      void logRestaurantInteraction({
        restaurantSlug,
        action: "shared",
      });
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
