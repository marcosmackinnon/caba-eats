import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import FavoriteButton from "@/components/FavoriteButton";
import { getRestaurantPhotoUrl } from "@/data/photos";
import { formatPrice, restaurants } from "@/data/restaurants";

type Props = { params: Promise<{ slugs: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const names = decodeURIComponent(slugs)
    .split(",")
    .map((s) => restaurants.find((r) => r.slug === s)?.name)
    .filter(Boolean)
    .slice(0, 3);
  return {
    title: `Shortlist · ${names.join(", ")} — CABA Eats`,
    description: `Te comparto mi shortlist de restaurantes en Buenos Aires: ${names.join(", ")}.`,
  };
}

export default async function SharedListPage({ params }: Props) {
  const { slugs } = await params;
  const slugList = decodeURIComponent(slugs)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

  const list = slugList
    .map((slug) => restaurants.find((r) => r.slug === slug))
    .filter(Boolean);

  if (list.length === 0) notFound();

  const previewNames = list.slice(0, 3).map((r) => r!.name);
  const label =
    previewNames.join(", ") +
    (list.length > 3 ? ` y ${list.length - 3} más` : "");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] px-4 py-4 pb-28 text-stone-900 sm:px-10 sm:py-8 md:pb-10 lg:px-12">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ead7c9] bg-white/90 text-lg text-stone-700 shadow-[0_12px_35px_rgba(201,97,36,0.08)]"
            aria-label="Ir al inicio"
          >
            ←
          </Link>
        </header>

        <section className="space-y-8 py-8 lg:py-10">
          {/* Title block */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f4cfb7] bg-white/80 px-3 py-2 text-sm font-medium text-stone-600">
              <span className="h-2 w-2 rounded-full bg-[#f27a3f]" />
              Shortlist compartida
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {list.length} lugar{list.length !== 1 ? "es" : ""} recomendados.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">
              {label} — guardados desde CABA Eats.
            </p>
            <Link
              href="/plan"
              className="inline-flex rounded-full bg-[#f27a3f] px-6 py-3 text-base font-semibold text-white shadow-[0_16px_35px_rgba(242,122,63,0.22)] transition hover:bg-[#e06a2f]"
            >
              Armar mi propia lista →
            </Link>
          </div>

          {/* Cards */}
          <div className="grid gap-5">
            {list.map((restaurant) => {
              if (!restaurant) return null;
              return (
                <article
                  key={restaurant.slug}
                  className="overflow-hidden rounded-[34px] border border-[#f0dccd] bg-white shadow-[0_22px_60px_rgba(201,97,36,0.1)]"
                >
                  <div
                    className="relative h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getRestaurantPhotoUrl(restaurant.cuisine, restaurant.slug)})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5">
                      <p className="text-sm text-white/80">{restaurant.imageLabel}</p>
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                        {restaurant.name}
                      </h2>
                      <p className="mt-1 text-stone-500">{restaurant.shortDescription}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-500">
                        <span>{restaurant.cuisine} · {restaurant.zone}</span>
                        <span className="text-stone-300">•</span>
                        <span>{formatPrice(restaurant.price)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {restaurant.vibeTags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#fff5ee] px-3 py-1.5 text-sm font-medium text-stone-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                      <FavoriteButton slug={restaurant.slug} label="Guardar" />
                      <Link
                        href={`/restaurant/${restaurant.slug}`}
                        className="rounded-full bg-[#f27a3f] px-5 py-3 text-center text-base font-semibold text-white shadow-[0_16px_35px_rgba(242,122,63,0.25)]"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
