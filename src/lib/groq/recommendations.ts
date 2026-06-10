import type { Restaurant } from "@/data/restaurants";

export type RecommendationFilters = {
  plan: string;
  cuisine: string;
  zone: string;
  vibes: string[];
  budget: number;
  distance: number;
  displayLocation: string;
};

export type GroqRecommendationItem = {
  slug: string;
  reason: string;
};

type GroqApiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type CompactRestaurant = {
  slug: string;
  name: string;
  cuisine: string;
  zone: string;
  price: number;
  distanceKm: number;
  rating: number;
  planFit: string[];
  vibeTags: string[];
  shortDescription: string;
  acceptsReservations: boolean;
};

function toCompactRestaurant(
  restaurant: Restaurant & { distanceKm: number },
): CompactRestaurant {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    zone: restaurant.zone,
    price: restaurant.price,
    distanceKm: Number(restaurant.distanceKm.toFixed(1)),
    rating: restaurant.rating,
    planFit: restaurant.planFit,
    vibeTags: restaurant.vibeTags,
    shortDescription: restaurant.shortDescription,
    acceptsReservations: restaurant.acceptsReservations,
  };
}

function buildUserPrompt(
  candidates: CompactRestaurant[],
  filters: RecommendationFilters,
) {
  const vibesLabel =
    filters.vibes.length > 0 ? filters.vibes.join(", ") : "Sin preferencia";

  return `Preferencias del usuario:
- Plan: ${filters.plan}
- Cocina: ${filters.cuisine}
- Ubicación de referencia: ${filters.displayLocation}
- Zona/barrio: ${filters.zone}
- Vibes: ${vibesLabel}
- Presupuesto máximo por persona: $${filters.budget.toLocaleString("es-AR")} ARS
- Radio máximo: ${filters.distance} km

Restaurantes disponibles (elegí exactamente 3 slugs distintos de esta lista):
${JSON.stringify(candidates)}`;
}

function parseGroqContent(content: string): GroqRecommendationItem[] | null {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;

  try {
    const parsed = JSON.parse(jsonText) as {
      recommendations?: Array<{ slug?: string; reason?: string }>;
    };

    if (!Array.isArray(parsed.recommendations)) {
      return null;
    }

    const items = parsed.recommendations
      .map((item) => ({
        slug: item.slug?.trim() ?? "",
        reason: item.reason?.trim() ?? "",
      }))
      .filter((item) => item.slug.length > 0);

    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

export async function getGroqRecommendations(
  candidates: Array<Restaurant & { distanceKm: number }>,
  filters: RecommendationFilters,
  limit = 3,
): Promise<GroqRecommendationItem[] | null> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || candidates.length === 0) {
    return null;
  }

  const compactCandidates = candidates.map(toCompactRestaurant);
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: `Sos un asistente de recomendaciones de restaurantes en Buenos Aires (CABA).
Tu trabajo es elegir exactamente ${limit} restaurantes del listado que mejor encajen con las preferencias del usuario.
Respondé SOLO con JSON válido, sin markdown ni texto extra, con este formato:
{"recommendations":[{"slug":"slug-del-restaurante","reason":"breve razón en español"}]}
Reglas:
- Usá SOLO slugs que existan en el listado.
- Devolvé exactamente ${limit} recomendaciones distintas.
- Priorizá distancia dentro del radio, presupuesto, plan, cocina y vibes.
- Si no hay match perfecto de cocina, elegí alternativas razonables y explicalo en la razón.`,
        },
        {
          role: "user",
          content: buildUserPrompt(compactCandidates, filters),
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Groq API error:", response.status, await response.text());
    return null;
  }

  const data = (await response.json()) as GroqApiResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  const parsed = parseGroqContent(content);
  if (!parsed) {
    return null;
  }

  const validSlugs = new Set(compactCandidates.map((item) => item.slug));
  const uniqueItems: GroqRecommendationItem[] = [];

  for (const item of parsed) {
    if (!validSlugs.has(item.slug)) continue;
    if (uniqueItems.some((existing) => existing.slug === item.slug)) continue;
    uniqueItems.push({
      slug: item.slug,
      reason: item.reason || "Encaja bien con lo que buscás.",
    });
    if (uniqueItems.length >= limit) break;
  }

  return uniqueItems.length >= limit ? uniqueItems : null;
}
