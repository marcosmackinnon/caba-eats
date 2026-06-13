"use client";

import { useFavorites } from "./FavoritesProvider";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function FavoriteButton({
  slug,
  label = "Guardar",
  compact = false,
}: {
  slug: string;
  label?: string;
  compact?: boolean;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(slug);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => toggleFavorite(slug)}
        aria-pressed={active}
        aria-label={active ? "Quitar de favoritos" : "Guardar en favoritos"}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition ${
          active
            ? "border-[#f27a3f] bg-[#fff1e7] text-[#c96124]"
            : "border-[#e8d6c8] bg-white text-stone-400 hover:text-[#c96124] hover:border-[#f27a3f]"
        }`}
      >
        <HeartIcon filled={active} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-base font-semibold transition ${
        active
          ? "border-[#f27a3f] bg-[#fff1e7] text-[#c96124]"
          : "border-[#e8d6c8] bg-white text-stone-700 hover:border-[#f27a3f] hover:text-[#c96124]"
      }`}
    >
      <HeartIcon filled={active} />
      {active ? "Guardado" : label}
    </button>
  );
}
