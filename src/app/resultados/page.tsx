import Link from "next/link";

import AppNavigation from "@/components/AppNavigation";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import {
  formatDistance,
  formatPrice,
  restaurants,
} from "@/data/restaurants";

type SearchParams = Promise<{
  plan?: string;
  cuisine?: string;
  zone?: string;
  vibe?: string;
  budget?: string;
  distance?: string;
}>;

function getResultBadge(index: number, restaurant: { rating: number; distanceKm: number; discoveryScore: number; momentumScore: number }, cuisine: string): string {
  if (index === 0) return "Mejor match";
  if (restaurant.rating >= 4.7) return "Muy valorado";
  if (restaurant.distanceKm <= 2) return "Más cercano";
  if (cuisine === "Sorprendeme" && restaurant.discoveryScore >= 8) return "Descubrí algo nuevo";
  if (restaurant.momentumScore >= 8) return "En tendencia";
  return "Buena opción";
}

// Score máximo teórico según el modo de búsqueda
function getMaxScore(cuisine: string): number {
  if (cuisine === "Sin preferencia") {
    // plan(4) + zone(2) + vibe(2) + distance(2) + price(3) + comfortScore(10) + distBonus(2) + ratingBonus(2)
    return 27;
  }
  if (cuisine === "Sorprendeme") {
    // plan(4) + zone(2) + vibe(2) + distance(2) + price(3) + discovery+momentum(20) + vibeBonus(4)
    return 37;
  }
  // plan(4) + exactCuisine(5) + zone(2) + vibe(2) + distance(2) + price(3)
  return 18;
}

function calculateMatchPercent(score: number, cuisine: string): number {
  const maxScore = getMaxScore(cuisine);
  const raw = Math.round((score / maxScore) * 100);
  return Math.min(98, Math.max(48, raw));
}

const cuisineFamilyMap: Record<string, string[]> = {
  "Sin preferencia": [],
  Sorprendeme: [],
  Italiana: ["Italiana", "Pizza"],
  Pizza: ["Pizza", "Italiana"],
  Japonesa: ["Japonesa", "Sushi"],
  Sushi: ["Sushi", "Japonesa"],
  Café: ["Café", "Brunch", "Postres"],
  Brunch: ["Brunch", "Café", "Postres"],
  Postres: ["Postres", "Café", "Brunch"],
  Vegetariana: ["Vegetariana", "Vegana"],
  Vegana: ["Vegana", "Vegetariana"],
  "Bar & tragos": ["Bar & tragos", "Café"],
};

function cuisineMatches(restaurantCuisine: string, selectedCuisine: string) {
  if (
    selectedCuisine === "Sin preferencia" ||
    selectedCuisine === "Sorprendeme"
  ) {
    return false;
  }

  const relatedCuisines = cuisineFamilyMap[selectedCuisine] ?? [selectedCuisine];

  return relatedCuisines.includes(restaurantCuisine);
}

function scoreRestaurant(
  restaurant: (typeof restaurants)[number],
  filters: {
    plan: string;
    cuisine: string;
    zone: string;
    vibes: string[];
    budget: number;
    distance: number;
  },
) {
  let score = 0;
  const isNeutralMode = filters.cuisine === "Sin preferencia";
  const isSurpriseMode = filters.cuisine === "Sorprendeme";
  const exactCuisineMatch = restaurant.cuisine === filters.cuisine;
  const relatedCuisineMatch = cuisineMatches(restaurant.cuisine, filters.cuisine);

  if (restaurant.planFit.includes(filters.plan)) score += 4;
  if (exactCuisineMatch) score += 5;
  else if (relatedCuisineMatch) score += 3;
  if (restaurant.zone === filters.zone) score += 2;
  if (filters.vibes.some((vibe) => restaurant.vibeTags.includes(vibe))) score += 2;
  if (restaurant.distanceKm <= filters.distance) score += 2;

  if (restaurant.price <= filters.budget) score += 3;
  else {
    const priceGap = restaurant.price - filters.budget;
    if (priceGap <= 8000) score += 1;
  }

  if (isNeutralMode) {
    score += restaurant.comfortScore;
    if (restaurant.distanceKm <= 3.5) score += 2;
    if (restaurant.rating >= 4.5) score += 2;
  }

  if (isSurpriseMode) {
    score += restaurant.discoveryScore + restaurant.momentumScore;
    if (restaurant.vibeTags.includes("Especial")) score += 2;
    if (restaurant.vibeTags.includes("Visual")) score += 1;
    if (restaurant.vibeTags.includes("Divertido")) score += 1;
  }

  return score;
}

function buildReason(
  restaurant: (typeof restaurants)[number],
  filters: {
    plan: string;
    cuisine: string;
    zone: string;
    vibes: string[];
    budget: number;
    distance: number;
  },
) {
  const reasons: string[] = [];
  const isNeutralMode = filters.cuisine === "Sin preferencia";
  const isSurpriseMode = filters.cuisine === "Sorprendeme";

  if (restaurant.planFit.includes(filters.plan)) {
    reasons.push(`funciona bien para ${filters.plan.toLowerCase()}`);
  }
  if (restaurant.cuisine === filters.cuisine) {
    reasons.push(`coincide con tu antojo de ${filters.cuisine.toLowerCase()}`);
  } else if (cuisineMatches(restaurant.cuisine, filters.cuisine)) {
    reasons.push(`va por la misma línea de ${filters.cuisine.toLowerCase()}`);
  }
  if (restaurant.zone === filters.zone) {
    reasons.push(`está en ${filters.zone}`);
  }
  const matchingVibe = filters.vibes.find((vibe) =>
    restaurant.vibeTags.includes(vibe),
  );
  if (matchingVibe) {
    reasons.push(`tiene una onda más ${matchingVibe.toLowerCase()}`);
  }
  if (restaurant.price <= filters.budget) {
    reasons.push("entra en tu presupuesto");
  }
  if (isNeutralMode) {
    reasons.push("es una elección confiable y fácil de cerrar");
  }
  if (isSurpriseMode) {
    reasons.push("tiene fuerza para descubrir algo distinto");
  }

  return `Lo elegimos porque ${reasons.slice(0, 3).join(", ")}.`;
}

function shortenText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function buildResultsIntro(cuisine: string) {
  if (cuisine === "Sin preferencia") {
    return "Como no marcaste una cocina puntual, priorizamos lugares confiables, fáciles de elegir y que encajan bien con el plan.";
  }

  if (cuisine === "Sorprendeme") {
    return "Como elegiste sorprenderte, priorizamos lugares con más personalidad, momentum y potencial de descubrimiento.";
  }

  return "Ordenamos las opciones según el contexto del plan, la comida, el presupuesto, la zona y la vibra del lugar.";
}

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

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
  };

  // Hard filter: excluir restaurantes fuera del radio elegido.
  // Si quedan menos de 3, completar con los más cercanos del dataset completo.
  const withinDistance = restaurants.filter(
    (r) => r.distanceKm <= filters.distance,
  );
  const candidatePool =
    withinDistance.length >= 3
      ? withinDistance
      : [...restaurants].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);

  const rankedRestaurants = [...candidatePool]
    .map((restaurant) => ({
      ...restaurant,
      score: scoreRestaurant(restaurant, filters),
      dynamicReason: buildReason(restaurant, filters),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Detectar si hay match exacto de cocina en los resultados
  const hasExactCuisineMatch =
    filters.cuisine !== "Sin preferencia" &&
    filters.cuisine !== "Sorprendeme" &&
    rankedRestaurants.some((r) => r.cuisine === filters.cuisine || cuisineMatches(r.cuisine, filters.cuisine));

  const showCuisineFallbackNotice =
    filters.cuisine !== "Sin preferencia" &&
    filters.cuisine !== "Sorprendeme" &&
    !hasExactCuisineMatch;

  const filterParams = new URLSearchParams({
    plan: filters.plan,
    cuisine: filters.cuisine,
    zone: filters.zone,
    vibe: filters.vibes.join(","),
    budget: String(filters.budget),
    distance: String(filters.distance),
  }).toString();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] px-4 py-4 pb-28 text-stone-900 sm:px-10 sm:py-6 md:pb-0 lg:px-12">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href={`/preferencias?plan=${encodeURIComponent(
              filters.plan,
            )}&cuisine=${encodeURIComponent(filters.cuisine)}`}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-xs font-medium text-white/90 sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  Decisión rápida
                </div>
                <span className="rounded-full bg-white/14 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
                  3 opciones
                </span>
              </div>

              <h1 className="max-w-2xl text-3xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-4xl">
                Estas opciones encajan con tu plan.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/82 sm:text-base sm:leading-7">
                {shortenText(buildResultsIntro(filters.cuisine), 120)}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  filters.plan,
                  filters.cuisine,
                  filters.zone,
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
                <span className="font-semibold text-stone-800">No encontramos {filters.cuisine} cerca.</span>{" "}
                Te mostramos las mejores opciones disponibles según tu plan, zona y presupuesto.
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {rankedRestaurants.map((restaurant, index) => (
              <article
                key={restaurant.slug}
                className="overflow-hidden rounded-[26px] border border-[#f0dccd] bg-white shadow-[0_18px_45px_rgba(201,97,36,0.1)]"
              >
                <div
                  className={`relative h-28 overflow-hidden sm:h-36 ${restaurant.heroClassName}`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${restaurant.cardAccentClassName}`}
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="rounded-full bg-white/88 px-2.5 py-1 text-xs font-semibold text-[#c96124] shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                      #{index + 1}
                    </span>
                    <span className="rounded-full bg-black/20 px-2.5 py-1 text-xs font-medium text-white/95 backdrop-blur-sm">
                      {getResultBadge(index, restaurant, filters.cuisine)}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                    <p className="max-w-md text-xs leading-5 text-white/82 sm:text-sm">
                      {shortenText(restaurant.imageLabel, 78)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-4 sm:p-5">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                          {restaurant.name}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-stone-500">
                          {shortenText(restaurant.shortDescription, 92)}
                        </p>
                      </div>
                      <button className="hidden rounded-full border border-[#e8d6c8] bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 sm:inline-flex">
                        ★ {restaurant.rating}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
                      <span>
                        {restaurant.cuisine} · {restaurant.zone}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span>
                        ★ {restaurant.rating} ({restaurant.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-[#fff8f2] p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                        Precio
                      </p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">
                        {formatPrice(restaurant.price)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#fff8f2] p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                        Distancia
                      </p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">
                        {formatDistance(restaurant.distanceKm)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#fff8f2] p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                        Match
                      </p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">
                        {calculateMatchPercent(restaurant.score, filters.cuisine)}%
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#fff8f2] p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                        Rating
                      </p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">
                        {restaurant.rating}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {restaurant.vibeTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#fff5ee] px-3 py-1.5 text-xs font-medium text-stone-600 sm:text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-[20px] bg-[#fff8f2] px-4 py-3">
                    <p className="text-sm leading-6 text-stone-600">
                      {shortenText(restaurant.dynamicReason, 108)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <FavoriteButton slug={restaurant.slug} label="Guardar" compact />
                      <ShareButton
                        title={restaurant.name}
                        text={`Mirá este lugar: ${restaurant.name} en ${restaurant.zone}.`}
                        url={`/restaurant/${restaurant.slug}?${filterParams}`}
                        label="Compartir"
                      />
                    </div>
                    <Link
                      href={`/restaurant/${restaurant.slug}?${filterParams}`}
                      className="rounded-full bg-[#f27a3f] px-5 py-3 text-center text-base font-semibold text-white shadow-[0_16px_35px_rgba(242,122,63,0.25)]"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <ShareButton
              title="Mi shortlist de restaurantes"
              text={`Te paso estas opciones para ${filters.plan.toLowerCase()} en ${filters.zone}.`}
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
