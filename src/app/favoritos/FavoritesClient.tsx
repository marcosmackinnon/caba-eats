"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import AppNavigation from "@/components/AppNavigation";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import { useFavorites } from "@/components/FavoritesProvider";
import { getLastSearchParamsKey } from "@/components/SearchSessionSync";
import {
  formatDistance,
  formatPrice,
  restaurants,
} from "@/data/restaurants";

export default function FavoritesClient() {
  const { favorites } = useFavorites();
  const lastSearchParams = useSyncExternalStore(
    () => () => {},
    () => window.localStorage.getItem(getLastSearchParamsKey()) ?? "",
    () => "",
  );
  const favoriteRestaurants = restaurants.filter((restaurant) =>
    favorites.includes(restaurant.slug),
  );
  const shortlistPreview = favoriteRestaurants.slice(0, 3).map((restaurant) => restaurant.name);
  const shortlistText =
    shortlistPreview.length === 0
      ? "Armé una shortlist en CABA Eats."
      : `Te paso mi shortlist de CABA Eats: ${shortlistPreview.join(", ")}${favoriteRestaurants.length > 3 ? " y algunos más" : ""}.`;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] px-4 py-4 pb-28 text-stone-900 sm:px-10 sm:py-6 md:pb-0 lg:px-12">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ead7c9] bg-white/90 text-lg text-stone-700 shadow-[0_12px_35px_rgba(201,97,36,0.08)]"
            aria-label="Volver al inicio"
          >
            ←
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <AppNavigation />
            <div className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-stone-600 shadow-[0_12px_35px_rgba(201,97,36,0.08)]">
              Tu lista guardada
            </div>
          </div>
        </header>

        <section className="space-y-8 py-8 lg:py-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f4cfb7] bg-white/80 px-3 py-2 text-sm font-medium text-stone-600">
              <span className="h-2 w-2 rounded-full bg-[#f27a3f]" />
              Favoritos
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Tus restaurantes guardados.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-stone-600">
              Esta lista te sirve para comparar más tarde o para llevar ideas a
              una salida futura.
            </p>
            {favoriteRestaurants.length > 0 ? (
              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <ShareButton
                  title="Mi shortlist de CABA Eats"
                  text={`${shortlistText} Si querés, podés armar la tuya acá.`}
                  url="/plan"
                  label="Compartir shortlist"
                />
                <Link
                  href="/plan"
                  className="rounded-full border border-[#e8d6c8] bg-white px-5 py-3 text-center text-base font-semibold text-stone-700 transition hover:bg-[#fff8f2]"
                >
                  Seguir explorando
                </Link>
              </div>
            ) : null}
          </div>

          {favoriteRestaurants.length === 0 ? (
            <div className="rounded-[36px] border border-[#f0dccd] bg-white p-8 text-center shadow-[0_24px_60px_rgba(201,97,36,0.1)]">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                Todavía no guardaste ningún lugar.
              </h2>
              <p className="mt-3 text-base leading-7 text-stone-600">
                Cuando explores resultados, vas a poder tocar “Guardar” y armar
                tu propia shortlist.
              </p>
              <Link
                href="/plan"
                className="mt-6 inline-flex rounded-full bg-[#f27a3f] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(242,122,63,0.25)]"
              >
                Buscar restaurantes
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {favoriteRestaurants.map((restaurant) => (
                <article
                  key={restaurant.slug}
                  className="overflow-hidden rounded-[34px] border border-[#f0dccd] bg-white shadow-[0_22px_60px_rgba(201,97,36,0.1)]"
                >
                  <div className={`relative h-52 ${restaurant.heroClassName}`}>
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${restaurant.cardAccentClassName}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="max-w-md text-sm leading-6 text-white/80">
                        {restaurant.imageLabel}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-3xl font-semibold tracking-[-0.03em]">
                          {restaurant.name}
                        </h2>
                        <p className="mt-1 text-stone-500">
                          {restaurant.shortDescription}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-500">
                          <span>
                            {restaurant.cuisine} · {restaurant.zone}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span>
                            ★ {restaurant.rating} ({restaurant.reviews})
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:min-w-56">
                        <div className="rounded-2xl bg-[#fff8f2] p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                            Precio estimado
                          </p>
                          <p className="mt-1 font-semibold text-stone-900">
                            {formatPrice(restaurant.price)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[#fff8f2] p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                            Distancia
                          </p>
                          <p className="mt-1 font-semibold text-stone-900">
                            {formatDistance(restaurant.distanceKm)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {restaurant.vibeTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#fff5ee] px-3 py-1.5 text-sm font-medium text-stone-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                      <FavoriteButton slug={restaurant.slug} label="Guardar" />
                      <Link
                        href={`/preferencias?plan=${encodeURIComponent(
                          restaurant.planFit[0] ?? "Con amigos",
                        )}&cuisine=${encodeURIComponent(
                          restaurant.cuisine,
                        )}&zone=${encodeURIComponent(
                          restaurant.zone,
                        )}&budget=${encodeURIComponent(
                          String(restaurant.price),
                        )}&distance=5&vibe=${encodeURIComponent(
                          restaurant.vibeTags.slice(0, 2).join(","),
                        )}`}
                        className="rounded-full border border-[#e8d6c8] bg-white px-5 py-3 text-center text-base font-semibold text-stone-700 transition hover:bg-[#fff8f2]"
                      >
                        Buscar parecido
                      </Link>
                      <Link
                        href={
                          lastSearchParams
                            ? `/restaurant/${restaurant.slug}?${lastSearchParams}`
                            : `/restaurant/${restaurant.slug}`
                        }
                        className="rounded-full bg-[#f27a3f] px-5 py-3 text-center text-base font-semibold text-white shadow-[0_16px_35px_rgba(242,122,63,0.25)]"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
