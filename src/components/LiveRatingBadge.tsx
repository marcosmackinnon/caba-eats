"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  restaurantSlug: string;
  fallbackRating: number;
  fallbackCount: number;
};

export default function LiveRatingBadge({ restaurantSlug, fallbackRating, fallbackCount }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState<{ count: number; avg: number } | null>(null);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("rating")
      .eq("restaurant_slug", restaurantSlug)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          setStats({ count: 0, avg: fallbackRating });
          return;
        }
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setStats({ count: data.length, avg: Math.round(avg * 10) / 10 });
      });
  }, [supabase, restaurantSlug, fallbackRating]);

  const rating = stats?.avg ?? fallbackRating;
  const count = stats?.count ?? fallbackCount;
  const label = count === 0 ? "Sin reseñas" : `${count} ${count === 1 ? "reseña" : "reseñas"}`;

  return (
    <span className="inline-flex rounded-full bg-white/16 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm">
      ★ {rating.toFixed(1)} · {label}
    </span>
  );
}
