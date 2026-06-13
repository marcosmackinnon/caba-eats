"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import AppNavigation from "@/components/AppNavigation";
import { getRestaurantPhotoUrl } from "@/data/photos";
import { restaurants } from "@/data/restaurants";

export const HISTORIAL_KEY = "dondy_historial";
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

export type HistorialEntry = {
  slug: string;
  visitedAt: number; // timestamp ms
};

// Cache para que getSnapshot retorne la misma referencia si el contenido no cambió
let cachedRaw: string | null = null;
let cachedEntries: HistorialEntry[] = [];

function getSnapshot(): HistorialEntry[] {
  try {
    const raw = localStorage.getItem(HISTORIAL_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const parsed: HistorialEntry[] = raw ? JSON.parse(raw) : [];
      cachedEntries = parsed.filter((e) => Date.now() - e.visitedAt < MAX_AGE_MS);
    }
    return cachedEntries;
  } catch {
    return cachedEntries;
  }
}

let storeListeners: (() => void)[] = [];

function subscribe(cb: () => void) {
  storeListeners.push(cb);
  const handler = (e: StorageEvent) => {
    if (e.key === HISTORIAL_KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => {
    storeListeners = storeListeners.filter((l) => l !== cb);
    window.removeEventListener("storage", handler);
  };
}

export function addToHistorial(slug: string) {
  try {
    const raw = localStorage.getItem(HISTORIAL_KEY);
    const entries: HistorialEntry[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const filtered = entries
      .filter((e) => e.slug !== slug && now - e.visitedAt < MAX_AGE_MS);
    filtered.unshift({ slug, visitedAt: now });
    const next = JSON.stringify(filtered.slice(0, 30));
    localStorage.setItem(HISTORIAL_KEY, next);
    cachedRaw = next;
    cachedEntries = filtered.slice(0, 30);
    storeListeners.forEach((l) => l());
  } catch {}
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

export default function HistorialClient() {
  const entries = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => cachedEntries,
  );

  const enriched = entries
    .map((entry) => ({
      ...entry,
      restaurant: restaurants.find((r) => r.slug === entry.slug),
    }))
    .filter((e) => e.restaurant != null);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] px-4 py-4 pb-28 text-stone-900 sm:px-10 sm:py-6 md:pb-0 lg:px-12">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead7c9] bg-white/90 text-lg text-stone-700 shadow-[0_12px_35px_rgba(201,97,36,0.08)]"
            aria-label="Volver al inicio"
          >
            ←
          </Link>
          <div className="flex items-center gap-3">
            <AppNavigation />
          </div>
        </header>

        <section className="space-y-4 py-4 sm:space-y-6 sm:py-6">
          <div className="overflow-hidden rounded-[30px] bg-[#f27a3f] px-5 py-7 text-white shadow-[0_24px_60px_rgba(201,97,36,0.2)]">
            <h1 className="text-3xl font-semibold leading-[0.98] tracking-[-0.05em]">
              Vistos recientemente
            </h1>
            <p className="mt-2 text-sm text-white/75">
              {enriched.length > 0
                ? `${enriched.length} restaurante${enriched.length !== 1 ? "s" : ""} visitado${enriched.length !== 1 ? "s" : ""}`
                : "Todavía no visitaste ninguno"}
            </p>
          </div>

          {enriched.length === 0 ? (
            <div className="rounded-[28px] border border-[#f0dccd] bg-white p-8 text-center shadow-[0_16px_45px_rgba(201,97,36,0.08)]">
              <p className="text-2xl">🍽️</p>
              <p className="mt-3 text-base font-medium text-stone-700">
                Todavía no exploraste ningún restaurante
              </p>
              <p className="mt-1 text-sm text-stone-400">
                Cuando entres al detalle de un restaurante, aparecerá acá.
              </p>
              <Link
                href="/plan"
                className="mt-5 inline-block rounded-full bg-[#f27a3f] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(242,122,63,0.3)]"
              >
                Buscar restaurantes →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enriched.map(({ restaurant, visitedAt }) => {
                const r = restaurant!;
                return (
                  <Link
                    key={`${r.slug}-${visitedAt}`}
                    href={`/restaurant/${r.slug}`}
                    className="group overflow-hidden rounded-[26px] border border-[#f0dccd] bg-white shadow-[0_12px_30px_rgba(201,97,36,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(201,97,36,0.15)]"
                  >
                    <div
                      className="relative h-36 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${getRestaurantPhotoUrl(r.cuisine, r.slug)})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-3">
                        <p className="text-xs font-medium text-white/80">{r.cuisine} · {r.zone}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-900">{r.name}</p>
                        <p className="mt-0.5 text-[11px] text-stone-400">{formatRelative(visitedAt)}</p>
                      </div>
                      <span className="shrink-0 text-sm text-stone-300 transition group-hover:text-[#f27a3f] group-hover:translate-x-0.5">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
