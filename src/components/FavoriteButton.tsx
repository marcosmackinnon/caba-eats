"use client";

import { useFavorites } from "./FavoritesProvider";

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

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      className={`rounded-full border text-base font-semibold transition ${
        compact
          ? "px-4 py-2.5"
          : "px-5 py-3"
      } ${
        active
          ? "border-[#f27a3f] bg-[#fff1e7] text-[#c96124]"
          : "border-[#e8d6c8] bg-white text-stone-700"
      }`}
      aria-pressed={active}
    >
      {active ? "Guardado" : label}
    </button>
  );
}
