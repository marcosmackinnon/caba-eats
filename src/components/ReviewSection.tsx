"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import { showToast } from "./Toast";

type Props = {
  restaurantSlug: string;
  restaurantName: string;
};

export default function ReviewSection({ restaurantSlug, restaurantName }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<{ count: number; avg: number | null }>({ count: 0, avg: null });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("rating")
      .eq("restaurant_slug", restaurantSlug)
      .then(({ data }) => {
        if (!data || data.length === 0) { setStats({ count: 0, avg: null }); return; }
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setStats({ count: data.length, avg: Math.round(avg * 10) / 10 });
      });
  }, [supabase, restaurantSlug, refreshKey]);

  function handleSuccess() {
    setShowForm(false);
    setRefreshKey((k) => k + 1);
    showToast("¡Reseña publicada!");
  }

  const isLoading = userId === undefined;

  return (
    <section id="resenas" className="space-y-5 rounded-[30px] border border-[#f0dccd] bg-white p-5 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold tracking-[-0.03em]">Reseñas</h2>
          {stats.count > 0 && (
            <span className="rounded-full bg-[#fff1e7] px-2.5 py-0.5 text-xs font-semibold text-[#c96124]">
              {stats.count}
            </span>
          )}
          {stats.avg !== null && (
            <span className="flex items-center gap-1 text-sm font-medium text-stone-500">
              <span className="text-[#f27a3f]">★</span>
              {stats.avg.toFixed(1)} promedio
            </span>
          )}
        </div>

        {!isLoading && (
          <>
            {!userId && (
              <Link
                href="/auth"
                className="rounded-full border border-[#f2b48a] bg-[#fff5ee] px-4 py-2 text-sm font-semibold text-[#c96124] transition hover:bg-[#ffeede]"
              >
                Ingresar para reseñar
              </Link>
            )}
            {userId && !showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-full bg-[#f27a3f] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(242,122,63,0.3)] transition hover:bg-[#e06a2f]"
              >
                + Agregar reseña
              </button>
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="rounded-[22px] border border-[#f0dccd] bg-[#fffaf6] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-800">Tu reseña de {restaurantName}</p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-stone-400 transition hover:text-stone-600"
            >
              Cancelar
            </button>
          </div>
          <ReviewForm
            restaurantSlug={restaurantSlug}
            restaurantName={restaurantName}
            onSuccess={handleSuccess}
          />
        </div>
      )}

      <ReviewList
        restaurantSlug={restaurantSlug}
        restaurantName={restaurantName}
        refreshKey={refreshKey}
        currentUserId={userId}
        onRefresh={() => setRefreshKey((k) => k + 1)}
      />
    </section>
  );
}
