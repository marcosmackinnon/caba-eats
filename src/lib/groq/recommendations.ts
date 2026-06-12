import type { Restaurant } from "@/data/restaurants";

export type RecommendationFilters = {
  plan: string;
  cuisine: string;
  /** Cocinas consideradas afines a la elegida (para completar si faltan del rubro exacto) */
  relatedCuisines?: string[];
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

// Payload minimo para que Groq decida. Se omiten campos pesados como
// shortDescription para no inflar el consumo de tokens (rate limits).
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
    acceptsReservations: restaurant.acceptsReservations,
  };
}

function buildUserPrompt(
  candidates: CompactRestaurant[],
  filters: RecommendationFilters,
) {
  const vibesLabel =
    filters.vibes.length > 0 ? filters.vibes.join(", ") : "Sin preferencia";
  const relatedLabel =
    filters.relatedCuisines && filters.relatedCuisines.length > 0
      ? filters.relatedCuisines.join(", ")
      : "ninguna en particular";

  return `Preferencias del usuario:
- Plan: ${filters.plan}
- Cocina: ${filters.cuisine}
- Cocinas afines aceptables (solo si no alcanzan las del rubro exacto): ${relatedLabel}
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
      temperature: 0,
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
- La cocina elegida por el usuario es la prioridad MÁXIMA: primero elegí
  restaurantes cuyo campo "cuisine" coincida EXACTAMENTE con la cocina pedida.
- Si en el listado no hay suficientes del rubro exacto para llegar a ${limit},
  completá SOLO con restaurantes de las "cocinas afines aceptables" indicadas, y
  aclará en la razón que es una alternativa cercana al rubro pedido.
- Nunca completes con una cocina que no sea ni la exacta ni una de las afines.
- Si la cocina pedida es "Sin preferencia" o "Sorprendeme", ignorá esta regla y
  priorizá plan, vibes, zona y presupuesto.
- Dentro de esas restricciones, priorizá distancia dentro del radio, presupuesto,
  plan y vibes.`,
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
