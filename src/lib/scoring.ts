import type { Restaurant } from "@/data/restaurants";

export type ScoringFilters = {
  plan: string;
  cuisine: string;
  zone: string;
  vibes: string[];
  budget: number;
  distance: number;
};

export type ScoredRestaurant = Restaurant & {
  distanceKm: number;
  score: number;
  dynamicReason: string;
  matchLabel: MatchLabel;
};

export type MatchLabel = "Ideal" | "Muy bueno" | "Buena opción" | "Alternativa";

// ─── Cocinas relacionadas ────────────────────────────────────────────────────

export const cuisineFamilyMap: Record<string, string[]> = {
  "Sin preferencia": [],
  Sorprendeme: [],
  // Cocinas relacionadas por sabor / experiencia
  Italiana: ["Italiana", "Pizza"],
  Pizza: ["Pizza", "Italiana"],
  Francesa: ["Francesa", "Italiana"],
  Española: ["Española", "Mariscos"],
  Peruana: ["Peruana", "Mariscos"],
  Mariscos: ["Mariscos", "Peruana", "Española"],
  Japonesa: ["Japonesa", "Sushi"],
  Sushi: ["Sushi", "Japonesa"],
  China: ["China", "Japonesa", "Coreana"],
  Coreana: ["Coreana", "Japonesa", "China"],
  Árabe: ["Árabe", "India"],
  India: ["India", "Árabe"],
  Mexicana: ["Mexicana", "Árabe"],
  Parrilla: ["Parrilla"],
  Hamburguesas: ["Hamburguesas"],
  // Plant-based
  Vegetariana: ["Vegetariana", "Vegana"],
  Vegana: ["Vegana", "Vegetariana"],
  // Social / bebidas
  Café: ["Café", "Brunch", "Postres"],
  Brunch: ["Brunch", "Café", "Postres"],
  Postres: ["Postres", "Café", "Brunch"],
  "Bar & tragos": ["Bar & tragos", "Café"],
};

export function cuisineMatches(
  restaurantCuisine: string,
  selectedCuisine: string,
): boolean {
  if (
    selectedCuisine === "Sin preferencia" ||
    selectedCuisine === "Sorprendeme"
  ) {
    return false;
  }
  const related = cuisineFamilyMap[selectedCuisine] ?? [selectedCuisine];
  return related.includes(restaurantCuisine);
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

export function getMaxScore(cuisine: string): number {
  if (cuisine === "Sin preferencia") return 27;
  if (cuisine === "Sorprendeme") return 37;
  return 18;
}

export function scoreRestaurant(
  restaurant: Restaurant & { distanceKm: number },
  filters: ScoringFilters,
): number {
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
  else if (restaurant.price - filters.budget <= 8000) score += 1;

  // Bonus por plan: ajuste fino para contextos específicos
  if (filters.plan === "Cita") {
    if (restaurant.vibeTags.includes("Romántico")) score += 3;
    if (restaurant.vibeTags.includes("Especial")) score += 2;
    if (restaurant.vibeTags.includes("Lindo")) score += 1;
    if (restaurant.acceptsReservations) score += 1;
  }
  if (filters.plan === "Algo rápido") {
    if (restaurant.vibeTags.includes("Rápido")) score += 3;
    if (!restaurant.acceptsReservations) score += 1; // no requiere reserva = más accesible
    if (restaurant.distanceKm <= 2) score += 2;
  }
  if (filters.plan === "En familia") {
    if (restaurant.vibeTags.includes("Social")) score += 2;
    if (restaurant.vibeTags.includes("Compartir")) score += 2;
    if (restaurant.price <= filters.budget * 0.8) score += 1; // margen presupuesto
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

// ─── Match label ─────────────────────────────────────────────────────────────
// Reemplaza el porcentaje arbitrario por etiquetas cualitativas honestas.
// Se basa en cuántos puntos "de impacto directo" acumuló el restaurante:
// planFit(4) + cuisineExact(5) + zone(2) + vibe(2) + budget(3) = 16 puntos duros.
// Los puntos de modo (comfortScore, discovery, etc.) son bonificaciones de contexto.

export function getMatchLabel(
  restaurant: Restaurant & { distanceKm: number },
  filters: ScoringFilters,
): MatchLabel {
  let hardScore = 0;
  if (restaurant.planFit.includes(filters.plan)) hardScore += 4;
  if (restaurant.cuisine === filters.cuisine) hardScore += 5;
  else if (cuisineMatches(restaurant.cuisine, filters.cuisine)) hardScore += 3;
  if (restaurant.zone === filters.zone) hardScore += 2;
  if (filters.vibes.some((v) => restaurant.vibeTags.includes(v))) hardScore += 2;
  if (restaurant.price <= filters.budget) hardScore += 3;

  const maxHard = filters.cuisine === "Sin preferencia" || filters.cuisine === "Sorprendeme"
    ? 11  // plan(4) + zone(2) + vibe(2) + budget(3)
    : 16; // plan(4) + cuisine(5) + zone(2) + vibe(2) + budget(3)

  const ratio = hardScore / maxHard;
  if (ratio >= 0.75) return "Ideal";
  if (ratio >= 0.5) return "Muy bueno";
  if (ratio >= 0.3) return "Buena opción";
  return "Alternativa";
}

// ─── Razón dinámica ───────────────────────────────────────────────────────────

export function buildReason(
  restaurant: Restaurant & { distanceKm: number },
  filters: ScoringFilters,
): string {
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

// ─── Badge de resultado ───────────────────────────────────────────────────────

export function getResultBadge(
  index: number,
  restaurant: { rating: number; distanceKm: number; discoveryScore: number; momentumScore: number },
  cuisine: string,
): string {
  if (index === 0) return "Mejor match";
  if (restaurant.rating >= 4.7) return "Muy valorado";
  if (restaurant.distanceKm <= 2) return "Más cercano";
  if (cuisine === "Sorprendeme" && restaurant.discoveryScore >= 8) return "Descubrí algo nuevo";
  if (restaurant.momentumScore >= 8) return "En tendencia";
  return "Buena opción";
}

// ─── Intro de resultados ──────────────────────────────────────────────────────

export function buildResultsIntro(cuisine: string): string {
  if (cuisine === "Sin preferencia") {
    return "Como no marcaste una cocina puntual, priorizamos lugares confiables, fáciles de elegir y que encajan bien con el plan.";
  }
  if (cuisine === "Sorprendeme") {
    return "Como elegiste sorprenderte, priorizamos lugares con más personalidad, momentum y potencial de descubrimiento.";
  }
  return "Ordenamos las opciones según el contexto del plan, la comida, el presupuesto, la zona y la vibra del lugar.";
}
