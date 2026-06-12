"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { restaurants } from "@/data/restaurants";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return restaurants
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.zone.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [query]);

  function handleBlur() {
    // pequeño delay para que el click en un resultado se registre antes de cerrar
    setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 rounded-full border border-[#e8d6c8] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(201,97,36,0.08)] focus-within:border-[#f27a3f] focus-within:shadow-[0_8px_24px_rgba(242,122,63,0.15)] transition-shadow">
        <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder="Buscá un restaurante, cocina o zona..."
          className="flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
        />
        {query && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
            className="text-stone-400 hover:text-stone-600"
            aria-label="Limpiar"
          >
            ×
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[20px] border border-[#f0dccd] bg-white shadow-[0_16px_40px_rgba(201,97,36,0.15)]">
          {results.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/restaurant/${r.slug}`}
                className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-[#fff8f2]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0e6] text-base">
                  {cuisineEmoji(r.cuisine)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-stone-800 truncate">{r.name}</p>
                  <p className="text-xs text-stone-400 truncate">{r.cuisine} · {r.zone}</p>
                </div>
                <span className="ml-auto shrink-0 text-xs text-stone-300">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-[20px] border border-[#f0dccd] bg-white px-4 py-4 shadow-[0_16px_40px_rgba(201,97,36,0.15)]">
          <p className="text-sm text-stone-400">Sin resultados para <span className="font-medium text-stone-600">"{query}"</span></p>
        </div>
      )}
    </div>
  );
}

function cuisineEmoji(cuisine: string): string {
  const map: Record<string, string> = {
    Parrilla: "🥩", Pizza: "🍕", Sushi: "🍣", Japonesa: "🍱",
    Italiana: "🍝", Mexicana: "🌮", Peruana: "🐟", China: "🥡",
    India: "🍛", Coreana: "🥢", Vegana: "🌿", Vegetariana: "🥗",
    Brunch: "🥞", Café: "☕", Hamburguesas: "🍔", Española: "🥘",
    Francesa: "🥐", "Bar & tragos": "🍸", Mariscos: "🦐", Postres: "🍰", Árabe: "🧆",
  };
  return map[cuisine] ?? "🍽️";
}
