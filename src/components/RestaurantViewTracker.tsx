"use client";

import { useEffect } from "react";

import { logRestaurantInteraction } from "@/lib/supabase/events";

export default function RestaurantViewTracker({
  slug,
  source,
}: {
  slug: string;
  source: string;
}) {
  useEffect(() => {
    void logRestaurantInteraction({
      restaurantSlug: slug,
      action: "view_detail",
      metadata: { source },
    });
  }, [slug, source]);

  return null;
}
