"use client";

import { createClient } from "./client";

export async function getCurrentUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function logSearchEvent(payload: {
  plan: string;
  cuisine: string;
  zone?: string;
  budget: number;
  distance: number;
  vibes: string[];
  userLabel?: string;
  userLat?: number;
  userLng?: number;
  selectedResults: string[];
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  const supabase = createClient();

  await supabase.from("search_events").insert({
    user_id: userId,
    plan: payload.plan,
    cuisine: payload.cuisine,
    zone: payload.zone ?? payload.userLabel ?? null,
    budget: payload.budget,
    distance_km: payload.distance,
    vibes: payload.vibes,
    user_lat: payload.userLat ?? null,
    user_lng: payload.userLng ?? null,
    selected_results: payload.selectedResults,
  });
}

export async function logRestaurantInteraction(payload: {
  restaurantSlug: string;
  action: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  const supabase = createClient();

  await supabase.from("restaurant_interactions").insert({
    user_id: userId,
    restaurant_slug: payload.restaurantSlug,
    action: payload.action,
    metadata: payload.metadata ?? {},
  });
}
