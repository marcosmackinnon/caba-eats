"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import ReviewForm from "./ReviewForm";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  body: string | null;
  photo_url: string;
  created_at: string;
  comida_rating: number | null;
  servicio_rating: number | null;
  ambiente_rating: number | null;
  noise_level: string | null;
  group_type: string | null;
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0;
        return (
          <svg key={star} viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
            <defs>
              <linearGradient id={`rl-${star}-${rating}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset={`${fill * 100}%`} stopColor="#f27a3f" />
                <stop offset={`${fill * 100}%`} stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#rl-${star}-${rating})`}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        );
      })}
      <span className="ml-1 text-xs font-semibold text-[#c96124]">{rating.toFixed(1)}</span>
    </span>
  );
}

function MiniSubRating({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-16 text-[11px] text-stone-400">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} viewBox="0 0 20 20" className="h-3 w-3" aria-hidden>
            <path fill={value >= s ? "#f27a3f" : "#e5e7eb"} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

export default function ReviewList({
  restaurantSlug,
  restaurantName,
  refreshKey,
  currentUserId,
  onRefresh,
}: {
  restaurantSlug: string;
  restaurantName: string;
  refreshKey: number;
  currentUserId: string | null | undefined;
  onRefresh: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("reviews")
        .select("id, user_id, rating, body, photo_url, created_at, comida_rating, servicio_rating, ambiente_rating, noise_level, group_type")
        .eq("restaurant_slug", restaurantSlug)
        .order("created_at", { ascending: false });
      setReviews((data as Review[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase, restaurantSlug, refreshKey]);

  async function handleDelete(reviewId: string) {
    setDeletingId(reviewId);
    await supabase.from("reviews").delete().eq("id", reviewId);
    setDeletingId(null);
    onRefresh();
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-[22px] border border-[#f0dccd] bg-white">
            <div className="h-32 bg-stone-100" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-24 rounded-full bg-stone-100" />
              <div className="h-3 w-40 rounded-full bg-stone-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-stone-400">
        Todavía no hay reseñas. ¡Sé el primero en dejar la tuya!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwn = currentUserId != null && review.user_id === currentUserId;
        const isEditing = editingId === review.id;
        const isDeleting = deletingId === review.id;
        const hasSubRatings = review.comida_rating || review.servicio_rating || review.ambiente_rating;

        return (
          <article
            key={review.id}
            className="overflow-hidden rounded-[22px] border border-[#f0dccd] bg-white shadow-[0_8px_24px_rgba(201,97,36,0.08)]"
          >
            {isEditing ? (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-800">Editar reseña</p>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-stone-400 transition hover:text-stone-600">
                    Cancelar
                  </button>
                </div>
                <ReviewForm
                  restaurantSlug={restaurantSlug}
                  restaurantName={restaurantName}
                  reviewId={review.id}
                  initialRating={review.rating}
                  initialBody={review.body ?? ""}
                  initialPhotoUrl={review.photo_url}
                  initialComidaRating={review.comida_rating}
                  initialServicioRating={review.servicio_rating}
                  initialAmbienteRating={review.ambiente_rating}
                  initialNoiseLevel={review.noise_level}
                  initialGroupType={review.group_type}
                  onSuccess={() => { setEditingId(null); onRefresh(); }}
                />
              </div>
            ) : (
              <>
                {/* Foto */}
                <div className="relative h-40 w-full">
                  <Image src={review.photo_url} alt="Foto de la visita" fill className="object-cover" />
                </div>

                <div className="space-y-3 p-4">
                  {/* Rating + fecha */}
                  <div className="flex items-center justify-between gap-2">
                    <StarDisplay rating={review.rating} />
                    <span className="text-xs text-stone-400">
                      {new Date(review.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {/* Sub-ratings */}
                  {hasSubRatings && (
                    <div className="rounded-[14px] bg-stone-50 p-3 space-y-1.5">
                      {review.comida_rating ? <MiniSubRating label="Comida" value={review.comida_rating} /> : null}
                      {review.servicio_rating ? <MiniSubRating label="Servicio" value={review.servicio_rating} /> : null}
                      {review.ambiente_rating ? <MiniSubRating label="Ambiente" value={review.ambiente_rating} /> : null}
                    </div>
                  )}

                  {/* Chips contextuales */}
                  {(review.noise_level || review.group_type) && (
                    <div className="flex flex-wrap gap-1.5">
                      {review.group_type && (
                        <span className="rounded-full bg-[#fff5ee] px-2.5 py-1 text-xs font-medium text-stone-600">
                          {review.group_type === "Solo" ? "👤" : review.group_type === "En pareja" ? "👫" : review.group_type === "Con amigos" ? "👥" : "👨‍👩‍👧"} {review.group_type}
                        </span>
                      )}
                      {review.noise_level && (
                        <span className="rounded-full bg-[#fff5ee] px-2.5 py-1 text-xs font-medium text-stone-600">
                          {review.noise_level === "Tranquilo" ? "🔇" : review.noise_level === "Moderado" ? "🔉" : "🔊"} {review.noise_level}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Comentario */}
                  {review.body && (
                    <p className="text-sm leading-6 text-stone-700">{review.body}</p>
                  )}

                  {/* Acciones propias */}
                  {isOwn && (
                    <div className="flex gap-3 border-t border-stone-100 pt-2">
                      <button type="button" onClick={() => setEditingId(review.id)} className="text-xs font-medium text-[#c96124] transition hover:underline">
                        Editar
                      </button>
                      <button type="button" disabled={isDeleting} onClick={() => handleDelete(review.id)} className="text-xs font-medium text-stone-400 transition hover:text-red-500 disabled:opacity-50">
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
