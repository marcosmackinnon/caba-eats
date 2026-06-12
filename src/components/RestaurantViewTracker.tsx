"use client";

import { useEffect } from "react";

import { addToHistorial } from "@/app/historial/HistorialClient";
import { logRestaurantInteraction } from "@/lib/supabase/events";

export default function RestaurantViewTracker({
  slug,
  source,
}: {
  slug: string;
  source: string;
}) {
  useEffect(() => {
    addToHistorial(slug);
    void logRestaurantInteraction({
      restaurantSlug: slug,
      action: "view_detail",
      metadata: { source },
    });
  }, [slug, source]);

  return null;
}
