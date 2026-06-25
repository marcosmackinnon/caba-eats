import Link from "next/link";

import AppNavigation from "@/components/AppNavigation";
import FavoriteButton from "@/components/FavoriteButton";
import RestaurantPhoto from "@/components/RestaurantPhoto";
import TrackRestaurantLink from "@/components/TrackRestaurantLink";
import SearchSessionSync from "@/components/SearchSessionSync";
import ShareButton from "@/components/ShareButton";
import { getRestaurantPhotoUrl } from "@/data/photos";
import {
  formatDistance,
  formatPrice,
  getRestaurantDistanceKm,
  restaurants,
} from "@/data/restaurants";
import { getGroqRecommendations } from "@/lib/groq/recommendations";
import {
  buildReason,
  cuisineFamilyMap,
  cuisineMatches,
  getMatchLabel,
  getResultBadge,
  scoreRestaurant,
} from "@/lib/scoring";

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
  offset?: string;
}>;

function shortenText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

const matchLabelColor: Record<string, string> = {
  Ideal: "text-[#c96124]",
  "Muy bueno": "text-[#b07050]",
  "Buena opción": "text-stone-700",
  Alternativa: "text-stone-500",
};

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const offset = Math.max(0, Number(params.offset ?? "0"));

  const filters = {
    plan: params.plan ?? "Con amigos",
    cuisine: params.cuisine ?? "Sin preferencia",
    zone: params.zone ?? "Palermo",
    vibes: (params.vibe ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    budget: Number(params.budget ?? "28000"),
    distance: Number(params.distance ?? "6"),
    userLat: params.userLat ? Number(params.userLat) : undefined,
    userLng: params.userLng ? Number(params.userLng) : undefined,
    userLabel: params.userLabel ?? undefined,
  };

  const hasGpsReference =
    Number.isFinite(filters.userLat) && Number.isFinite(filters.userLng);
  const displayLocation = hasGpsReference
    ? filters.userLabel ?? "Tu ubicación actual"
    : filters.zone;
  const locationZone = hasGpsReference
    ? displayLocation.replace(", CABA", "")
    : filters.zone;

  const enrichedRestaurants = restaurants.map((restaurant) => ({
    ...restaurant,
    distanceKm: getRestaurantDistanceKm(restaurant, {
      userLat: filters.userLat,
      userLng: filters.userLng,
      zone: hasGpsReference ? undefined : filters.zone,
    }),
  }));

  // Hard filter: excluir restaurantes fuera del radio elegido.
  // Si quedan menos de 3, completar con los más cercanos del dataset completo.
  const withinDistance = enrichedRestaurants.filter(
    (r) => r.distanceKm <= filters.distance,
  );
  const candidatePool =
    withinDistance.length >= 3
      ? withinDistance
      : [...enrichedRestaurants].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, Math.max(6, withinDistance.length + 3));

  const showDistanceFallbackNotice =
    offset === 0 && candidatePool.some((r) => r.distanceKm > filters.distance);

  // Hard filter: excluir restaurantes que superen el presupuesto.
  // Si quedan menos de 3, completar con los más baratos del pool de distancia.
  const withinBudget = candidatePool.filter((r) => r.price <= filters.budget);
  const budgetPool =
    withinBudget.length >= 3
      ? withinBudget
      : [...candidatePool].sort((a, b) => a.price - b.price).slice(0, Math.max(6, withinBudget.length + 3));

  const scoringFilters = { ...filters, zone: locationZone };

  const enrichRestaurant = (restaurant: (typeof budgetPool)[number]) => ({
    ...restaurant,
    score: scoreRestaurant(restaurant, scoringFilters),
    dynamicReason: buildReason(restaurant, scoringFilters),
    matchLabel: getMatchLabel(restaurant, scoringFilters),
  });

  // cuisineFamilyMap[cocina] = cocina exacta + cocinas afines. Vacio para
  // "Sin preferencia"/"Sorprendeme". Lo usan tanto Groq como el fallback local
  // para no mezclar rubros cuando el usuario pidio una cocina puntual.
  const cuisineFamily = cuisineFamilyMap[filters.cuisine] ?? [];
  const relatedCuisines = cuisineFamily.filter((c) => c !== filters.cuisine);

  // Pool para el ranking local (fallback): si el usuario eligio una cocina
  // puntual y hay >=3 del rubro+afines, restringimos a esos; si no, todo el pool.
  const cuisineScopedBudgetPool =
    cuisineFamily.length > 0
      ? budgetPool.filter((r) => cuisineFamily.includes(r.cuisine))
      : [];
  const fallbackPool =
    cuisineScopedBudgetPool.length >= 3 ? cuisineScopedBudgetPool : budgetPool;

  // Rankear el pool disponible (fallback y paginación)
  const allRanked = [...fallbackPool]
    .map(enrichRestaurant)
    .sort((a, b) => b.score - a.score);

  type RankedRestaurant = (typeof allRanked)[number];

  let rankedRestaurants: RankedRestaurant[];
  let sponsoredCandidate: RankedRestaurant | null = null;
  let usedGroqRecommendations = false;

  if (offset === 0) {
    // Groq elige los 3. Si el usuario pidio una cocina puntual, le pasamos solo
    // los candidatos de ese rubro + afines (garantia en codigo de que no se cuele
    // otra cocina y, de paso, menos tokens). Si no llegan a 3, o si es "Sin
    // preferencia"/"Sorprendeme", Groq elige sobre la base completa.
    const cuisineScopedPool =
      cuisineFamily.length > 0
        ? enrichedRestaurants.filter((r) => cuisineFamily.includes(r.cuisine))
        : [];

    const groqCandidates =
      cuisineScopedPool.length >= 3 ? cuisineScopedPool : enrichedRestaurants;

    const groqRecommendations = await getGroqRecommendations(groqCandidates, {
      plan: filters.plan,
      cuisine: filters.cuisine,
      relatedCuisines,
      zone: locationZone,
      vibes: filters.vibes,
      budget: filters.budget,
      distance: filters.distance,
      displayLocation,
    });

    if (groqRecommendations) {
      const restaurantBySlug = new Map(
        enrichedRestaurants.map((restaurant) => [restaurant.slug, restaurant]),
      );

      rankedRestaurants = groqRecommendations
        .map((item) => {
          const restaurant = restaurantBySlug.get(item.slug);
          if (!restaurant) return null;

          const enriched = enrichRestaurant(restaurant);
          return {
            ...enriched,
            dynamicReason: item.reason.startsWith("Lo elegimos")
              ? item.reason
              : `Lo elegimos porque ${item.reason}`,
          };
        })
        .filter((restaurant): restaurant is RankedRestaurant => restaurant != null);

      usedGroqRecommendations = rankedRestaurants.length === 3;
    } else {
      rankedRestaurants = [];
    }
  } else {
    rankedRestaurants = [];
  }

  if (!usedGroqRecommendations) {
    // Fallback local si Groq no responde o en paginación
    const MIN_SPONSORED_SCORE = 4;

    sponsoredCandidate =
      offset === 0
        ? allRanked
            .filter((r) => r.sponsored != null && r.score >= MIN_SPONSORED_SCORE)
            .sort((a, b) => b.sponsored!.discountPct - a.sponsored!.discountPct)[0] ??
          null
        : null;

    if (sponsoredCandidate) {
      const sponsored = sponsoredCandidate;
      const organic = allRanked
        .filter((r) => r.slug !== sponsored.slug)
        .slice(0, 2);
      rankedRestaurants = [sponsored, ...organic];
    } else {
      rankedRestaurants = allRanked.slice(offset, offset + 3);
    }
  }

  const hasMoreResults = allRanked.length > offset + 3;
  const isShowingAlternatives = offset > 0;

  // Detectar si hay match exacto de cocina en los resultados
  const hasExactCuisineMatch =
    filters.cuisine !== "Sin preferencia" &&
    filters.cuisine !== "Sorprendeme" &&
    rankedRestaurants.some(
      (r) => r.cuisine === filters.cuisine || cuisineMatches(r.cuisine, filters.cuisine),
    );

  const showCuisineFallbackNotice =
    offset === 0 &&
    filters.cuisine !== "Sin preferencia" &&
    filters.cuisine !== "Sorprendeme" &&
    !hasExactCuisineMatch;

  const showBudgetFallbackNotice =
    offset === 0 && rankedRestaurants.some((r) => r.price > filters.budget);

  // filterParams sin offset (para links de volver / compartir)
  const filterParams = new URLSearchParams({
    plan: filters.plan,
    cuisine: filters.cuisine,
    vibe: filters.vibes.join(","),
    budget: String(filters.budget),
    distance: String(filters.distance),
    ...(hasGpsReference
      ? {
          userLat: String(filters.userLat),
          userLng: String(filters.userLng),
          userLabel: displayLocation,
        }
      : { zone: filters.zone }),
  }).toString();

  const nextOffsetParams = `${filterParams}&offset=${offset + 3}`;
  const prevOffsetParams = offset >= 3 ? `${filterParams}&offset=${offset - 3}` : filterParams;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] px-4 py-4 pb-28 text-stone-900 sm:px-10 sm:py-6 md:pb-0 lg:px-12">
      <SearchSessionSync
        params={filterParams}
        payload={{
          plan: filters.plan,
          cuisine: filters.cuisine,
          zone: filters.zone,
          budget: filters.budget,
          distance: filters.distance,
          vibes: filters.vibes,
          userLabel: filters.userLabel,
          userLat: filters.userLat,
          userLng: filters.userLng,
          selectedResults: rankedRestaurants.map((restaurant) => restaurant.slug),
        }}
      />
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href={`/preferencias?${filterParams}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead7c9] bg-white/90 text-lg text-stone-700 shadow-[0_12px_35px_rgba(201,97,36,0.08)]"
            aria-label="Volver a filtros"
          >
            ←
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <AppNavigation />
            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-stone-600 shadow-[0_12px_35px_rgba(201,97,36,0.08)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f27a3f]" />
              Paso 4 de 4
            </div>
          </div>
        </header>

        <section className="space-y-4 py-4 sm:space-y-6 lg:py-10">
          <div className="overflow-hidden rounded-[28px] bg-[#f27a3f] p-4 text-white shadow-[0_20px_50px_rgba(201,97,36,0.2)] sm:rounded-[34px] sm:p-6">
            <div className="space-y-4">
              <h1 className="max-w-2xl text-3xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-4xl">
                {isShowingAlternatives
                  ? "Otras opciones."
                  : "Estas son tus opciones."}
              </h1>
              <div className="flex flex-wrap gap-2">
                {[
                  filters.plan,
                  filters.cuisine,
                  displayLocation,
                  ...(filters.vibes.length > 0 ? filters.vibes : []),
                  `$${filters.budget.toLocaleString("es-AR")}`,
                  `${filters.distance} km`,
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/16 px-3 py-1.5 text-xs font-medium text-white/92 sm:text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {showCuisineFallbackNotice && (
            <div className="rounded-[22px] border border-[#f0dccd] bg-white/88 px-4 py-3 shadow-[0_8px_24px_rgba(201,97,36,0.08)]">
              <p className="text-sm leading-6 text-stone-600">
                <span className="font-semibold text-stone-800">
                  No encontramos {filters.cuisine} cerca.
                </span>{" "}
                Te mostramos las mejores opciones disponibles según tu plan, ubicación y presupuesto.
              </p>
            </div>
          )}

          {showDistanceFallbackNotice && (
            <div className="rounded-[22px] border border-[#f7d9c5] bg-[#fff7f1] px-4 py-3 shadow-[0_8px_24px_rgba(201,97,36,0.08)]">
              <p className="text-sm leading-6 text-stone-600">
                <span className="font-semibold text-stone-800">
                  No encontramos suficientes opciones dentro de tu radio de {filters.distance} km.
                </span>{" "}
                Sumamos algunas alternativas cercanas, aunque queden un poco más lejos de{" "}
                {displayLocation}.
              </p>
            </div>
          )}

          {showBudgetFallbackNotice && (
            <div className="rounded-[22px] border border-[#f0dccd] bg-white/88 px-4 py-3 shadow-[0_8px_24px_rgba(201,97,36,0.08)]">
              <p className="text-sm leading-6 text-stone-600">
                <span className="font-semibold text-stone-800">
                  No hay suficientes opciones dentro de tu presupuesto.
                </span>{" "}
                Incluimos los más accesibles disponibles cerca de {displayLocation}.
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {rankedRestaurants.map((restaurant, index) => (
              <article
                key={restaurant.slug}
                className="overflow-hidden rounded-[26px] border border-[#f0dccd] bg-white shadow-[0_18px_45px_rgba(201,97,36,0.1)]"
              >
                <RestaurantPhoto
                  src={getRestaurantPhotoUrl(restaurant.cuisine, restaurant.slug)}
                  alt={restaurant.name}
                  fallbackClassName={restaurant.heroClassName}
                  overlayClassName={restaurant.cardAccentClassName}
                  className="h-36 sm:h-44"
                >
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="rounded-full bg-white/88 px-2.5 py-1 text-xs font-semibold text-[#c96124] shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                      #{offset + index + 1}
                    </span>
                    <span className="rounded-full bg-black/20 px-2.5 py-1 text-xs font-medium text-white/95 backdrop-blur-sm">
                      {getResultBadge(offset + index, restaurant, filters.cuisine)}
                    </span>
                  </div>
                </RestaurantPhoto>

                <div className="space-y-3 p-4 sm:p-5">
                  {/* Nombre + match label */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-xl font-semibold tracking-[-0.03em]">
                        {restaurant.name}
                      </h2>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        restaurant.matchLabel === "Ideal"
                          ? "border-[#f2b48a] bg-[#fff1e7] text-[#c96124]"
                          : restaurant.matchLabel === "Muy bueno"
                          ? "border-[#e8d6c8] bg-[#fff8f2] text-[#b07050]"
                          : restaurant.matchLabel === "Buena opción"
                          ? "border-stone-200 bg-stone-50 text-stone-600"
                          : "border-stone-100 bg-white text-stone-400"
                      }`}>
                        {restaurant.matchLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      {shortenText(restaurant.shortDescription, 80)}
                    </p>
                  </div>

                  {/* Razón dinámica */}
                  {restaurant.dynamicReason && (
                    <p className="rounded-[14px] bg-[#fff8f2] px-3.5 py-2.5 text-xs leading-5 text-stone-600 border border-[#f4e0d0]">
                      ✦ {restaurant.dynamicReason}
                    </p>
                  )}

                  {/* Metadata inline */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#fff5ee] px-3 py-1 text-xs font-medium text-stone-600">
                      {restaurant.cuisine} · {restaurant.zone}
                    </span>
                    <span className="rounded-full bg-[#fff5ee] px-3 py-1 text-xs font-medium text-stone-600">
                      ★ {restaurant.rating}
                    </span>
                    <span className="rounded-full bg-[#fff5ee] px-3 py-1 text-xs font-medium text-stone-600">
                      {formatPrice(restaurant.price)}
                    </span>
                    <span className="rounded-full bg-[#fff5ee] px-3 py-1 text-xs font-medium text-stone-600">
                      📍 {formatDistance(restaurant.distanceKm)}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-2">
                    <FavoriteButton slug={restaurant.slug} label="Guardar" compact />
                    <TrackRestaurantLink
                      href={`/restaurant/${restaurant.slug}?${filterParams}`}
                      restaurantSlug={restaurant.slug}
                      className="flex-1 rounded-full bg-[#f27a3f] px-5 py-3 text-center text-base font-semibold text-white shadow-[0_16px_35px_rgba(242,122,63,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(242,122,63,0.32)]"
                    >
                      Ver detalle →
                    </TrackRestaurantLink>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Paginación de resultados */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {hasMoreResults && (
              <Link
                href={`/resultados?${nextOffsetParams}`}
                className="flex-1 rounded-full border border-[#f2b48a] bg-[#fff5ee] px-5 py-3 text-center text-base font-semibold text-[#c96124]"
              >
                Ver otras opciones →
              </Link>
            )}
            {isShowingAlternatives && (
              <Link
                href={`/resultados?${prevOffsetParams}`}
                className="flex-1 rounded-full border border-[#e8d6c8] bg-white px-5 py-3 text-center text-base font-semibold text-stone-700"
              >
                ← Volver a las mejores
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <ShareButton
              title="Mi shortlist de restaurantes"
              text={`Te paso estas opciones para ${filters.plan.toLowerCase()} cerca de ${displayLocation}.`}
              url={`/resultados?${filterParams}`}
              label="Compartir shortlist"
            />
            <Link
              href={`/preferencias?plan=${encodeURIComponent(filters.plan)}&cuisine=${encodeURIComponent(filters.cuisine)}`}
              className="rounded-full border border-[#e8d6c8] bg-white px-5 py-3 text-center text-base font-semibold text-stone-700"
            >
              Ajustar filtros
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
