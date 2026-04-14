import Link from "next/link";
import { notFound } from "next/navigation";

import AppNavigation from "@/components/AppNavigation";
import FavoriteButton from "@/components/FavoriteButton";
import MenuSheet from "@/components/MenuSheet";
import RestaurantViewTracker from "@/components/RestaurantViewTracker";
import ShareButton from "@/components/ShareButton";
import {
  formatDistance,
  formatPrice,
  getRestaurantDistanceKm,
  restaurants,
} from "@/data/restaurants";

type SearchParams = Promise<{
  plan?: string;
  cuisine?: string;
  zone?: string;
  vibe?: string;
  budget?: string;
  distance?: string;
  userLat?: string;
  userLng?: string;
  userLabel?: string;
}>;

type Params = Promise<{
  slug: string;
}>;

function buildMenuItems(restaurant: (typeof restaurants)[number]) {
  const multipliers = [0.38, 0.46, 0.58];

  return restaurant.menuHighlights.map((item, index) => ({
    name: item,
    price: Math.round((restaurant.price * multipliers[index % multipliers.length]) / 500) * 500,
  }));
}

export default async function RestaurantDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const filters = await searchParams;
  const restaurant = restaurants.find((item) => item.slug === slug);

  if (!restaurant) {
    notFound();
  }

  const hasGpsReference = Boolean(filters.userLat && filters.userLng);
  const backParams = new URLSearchParams({
    plan: filters.plan ?? "Con amigos",
    cuisine: filters.cuisine ?? "Sin preferencia",
    vibe: filters.vibe ?? "",
    budget: filters.budget ?? "28000",
    distance: filters.distance ?? "6",
    ...(hasGpsReference
      ? {
          userLat: filters.userLat ?? "",
          userLng: filters.userLng ?? "",
          userLabel: filters.userLabel ?? "Tu ubicación actual",
        }
      : { zone: filters.zone ?? "Palermo" }),
  }).toString();
  const menuItems = buildMenuItems(restaurant);
  const computedDistance = getRestaurantDistanceKm(restaurant, {
    userLat: filters.userLat ? Number(filters.userLat) : undefined,
    userLng: filters.userLng ? Number(filters.userLng) : undefined,
    zone: filters.zone,
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] px-4 py-4 pb-28 text-stone-900 sm:px-10 sm:py-6 md:pb-0 lg:px-12">
      <RestaurantViewTracker
        slug={restaurant.slug}
        source={hasGpsReference ? "gps" : filters.zone ?? "unknown"}
      />
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href={`/resultados?${backParams}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead7c9] bg-white/90 text-lg text-stone-700 shadow-[0_12px_35px_rgba(201,97,36,0.08)]"
            aria-label="Volver a resultados"
          >
            ←
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <AppNavigation />
            <div className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-stone-600 shadow-[0_12px_35px_rgba(201,97,36,0.08)]">
              Ficha del restaurante
            </div>
          </div>
        </header>

        <section className="space-y-6 py-6 sm:space-y-8 lg:py-12">
          <div
            className={`relative overflow-hidden rounded-[34px] ${restaurant.heroClassName} p-5 text-white shadow-[0_28px_80px_rgba(201,97,36,0.22)] sm:p-10`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-t ${restaurant.cardAccentClassName}`}
            />
            <div className="relative space-y-4 sm:max-w-3xl sm:space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-white/16 px-3 py-2 text-sm font-medium backdrop-blur-sm">
                  {restaurant.cuisine} · {restaurant.zone}
                </span>
                <span className="inline-flex rounded-full bg-white/16 px-3 py-2 text-sm font-medium backdrop-blur-sm">
                  ★ {restaurant.rating} · {restaurant.reviews} reseñas
                </span>
              </div>
              <h1 className="text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                {restaurant.name}
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
                {restaurant.shortDescription}
              </p>
              <p className="max-w-lg text-sm leading-6 text-white/75">
                {restaurant.imageLabel}
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="space-y-5 rounded-[30px] border border-[#f0dccd] bg-white p-4 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-6">
              <MenuSheet
                restaurantName={restaurant.name}
                cuisine={restaurant.cuisine}
                zone={restaurant.zone}
                items={menuItems}
              />

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Resumen rápido
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#fff8f2] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                      Precio
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatPrice(restaurant.price)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#fff8f2] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                      Distancia
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatDistance(computedDistance)}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-[#fff8f2] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                      Reservas
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {restaurant.acceptsReservations ? "Acepta reservas" : "Sin reserva previa"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-[24px] bg-[#fff8f2] p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                    Dirección
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-6 text-stone-800">
                    {restaurant.address}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                    Horarios
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-stone-700">
                    {restaurant.hours}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#fff8f2] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Entorno
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  {restaurant.neighborhoodNote}
                </p>
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

              <div className="grid grid-cols-2 gap-3">
                <FavoriteButton
                  slug={restaurant.slug}
                  label="Guardar"
                  compact
                />
                <ShareButton
                  title={restaurant.name}
                  text={`Te comparto ${restaurant.name}, una opción de ${restaurant.cuisine} en ${restaurant.zone}.`}
                  url={`/restaurant/${restaurant.slug}?${backParams}`}
                  label="Compartir"
                  restaurantSlug={restaurant.slug}
                />
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-full bg-[#f27a3f] px-5 py-3 text-center text-base font-semibold text-white shadow-[0_16px_35px_rgba(242,122,63,0.25)]"
              >
                Cómo llegar →
              </a>
            </aside>

            <div className="space-y-5">
              <article className="rounded-[30px] border border-[#f0dccd] bg-white p-5 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Por qué aparece
                </p>
                <p className="mt-4 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                  {restaurant.reason}
                </p>
              </article>

              <article className="rounded-[30px] border border-[#f0dccd] bg-white p-5 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Ideal para
                </p>
                <p className="mt-4 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                  {restaurant.idealFor}
                </p>
              </article>

              <article className="rounded-[30px] border border-[#f0dccd] bg-white p-5 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Lo más destacado
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {restaurant.highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[#fff8f2] px-3 py-2 text-sm font-medium text-stone-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>

              <article className="rounded-[30px] border border-[#f0dccd] bg-white p-5 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Reseña breve
                </p>
                <blockquote className="mt-4 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                  “{restaurant.reviewQuote}”
                </blockquote>
              </article>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
