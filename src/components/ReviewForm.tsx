"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import StarPicker from "./StarPicker";

type Props = {
  restaurantSlug: string;
  restaurantName: string;
  onSuccess: () => void;
  reviewId?: string;
  initialRating?: number;
  initialBody?: string;
  initialPhotoUrl?: string;
  initialPriceRange?: string | null;
};

const PRICE_OPTIONS = [
  "Menos de $15.000",
  "$15.000 – $30.000",
  "$30.000 – $50.000",
  "$50.000 – $80.000",
  "Más de $80.000",
];

export default function ReviewForm({
  restaurantSlug,
  restaurantName,
  onSuccess,
  reviewId,
  initialRating = 0,
  initialBody = "",
  initialPhotoUrl,
  initialPriceRange = null,
}: Props) {
  const isEdit = Boolean(reviewId);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [rating, setRating] = useState(initialRating);
  const [body, setBody] = useState(initialBody);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl ?? null);
  const [priceRange, setPriceRange] = useState<string | null>(initialPriceRange ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Solo se permiten imágenes."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("La foto no puede superar los 8 MB."); return; }
    setError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating === 0) { setError("Elegí un puntaje."); return; }
    if (!isEdit && !photoFile) { setError("La foto es obligatoria."); return; }
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    let photoUrl = initialPhotoUrl ?? "";
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `${user.id}/${restaurantSlug}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("review-photos")
        .upload(path, photoFile, { upsert: false });
      if (uploadError) { setError(`No se pudo subir la foto: ${uploadError.message}`); setSubmitting(false); return; }
      const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(path);
      photoUrl = urlData.publicUrl;
    }

    const payload = {
      rating,
      body: body.trim() || null,
      photo_url: photoUrl,
      price_range: priceRange,
    };

    if (isEdit) {
      const { error: err } = await supabase.from("reviews").update(payload).eq("id", reviewId);
      if (err) { setError("No se pudo guardar el cambio."); setSubmitting(false); return; }
    } else {
      const { error: err } = await supabase.from("reviews").insert({
        user_id: user.id,
        restaurant_slug: restaurantSlug,
        ...payload,
      });
      if (err) { setError("No se pudo guardar la reseña."); setSubmitting(false); return; }
    }

    setSubmitting(false);
    onSuccess();
  }

  const ratingLabel = rating === 0 ? "" : rating <= 1 ? "Muy malo" : rating <= 2 ? "Malo" : rating <= 3 ? "Regular" : rating <= 4 ? "Bueno" : "Excelente";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 1 · Puntaje general (obligatorio) */}
      <div>
        <p className="mb-2 text-sm font-semibold text-stone-800">
          Puntaje <span className="text-[#f27a3f]">*</span>
        </p>
        <StarPicker value={rating} onChange={setRating} disabled={submitting} />
        {ratingLabel && (
          <p className="mt-1.5 text-xs font-medium text-[#c96124]">{ratingLabel}</p>
        )}
      </div>

      {/* 2 · Foto (obligatoria en create, opcional en edit) */}
      <div>
        <p className="mb-2 text-sm font-semibold text-stone-800">
          Foto de tu visita{" "}
          {!isEdit
            ? <span className="text-[#f27a3f]">*</span>
            : <span className="text-xs font-normal text-stone-400">(opcional)</span>}
        </p>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} disabled={submitting} />
        {photoPreview ? (
          <div>
            <div className="relative h-44 w-full overflow-hidden rounded-2xl">
              <Image src={photoPreview} alt="Vista previa" fill className="object-cover" />
            </div>
            <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(initialPhotoUrl ?? null); if (fileRef.current) fileRef.current.value = ""; }} className="mt-2 text-xs text-stone-400 underline">
              Cambiar foto
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={submitting} className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#f0dccd] bg-[#fff8f2] py-8 text-sm font-medium text-stone-500 transition hover:border-[#f27a3f] hover:text-[#c96124]">
            <span className="text-2xl">📷</span>
            Subir foto de tu visita
          </button>
        )}
      </div>

      {/* 3 · Presupuesto (opcional) */}
      <div>
        <p className="mb-2.5 text-sm font-semibold text-stone-800">
          ¿Cuánto gastaste por persona? <span className="text-xs font-normal text-stone-400">· opcional</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={submitting}
              onClick={() => setPriceRange(priceRange === opt ? null : opt)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                priceRange === opt
                  ? "border-[#f27a3f] bg-[#fff1e7] text-[#c96124]"
                  : "border-stone-200 bg-white text-stone-600 hover:border-[#f2b48a]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 4 · Comentario (opcional) */}
      <div>
        <p className="mb-2 text-sm font-semibold text-stone-800">
          Comentario <span className="text-xs font-normal text-stone-400">· opcional</span>
        </p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder={`¿Qué te pareció ${restaurantName}?`}
          disabled={submitting}
          className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-[#f27a3f] focus:bg-white transition"
        />
        <p className="mt-1 text-right text-xs text-stone-400">{body.length}/500</p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || rating === 0 || (!isEdit && !photoFile)}
        className="w-full rounded-full bg-[#f27a3f] py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(242,122,63,0.3)] transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        {submitting ? (isEdit ? "Guardando..." : "Publicando...") : (isEdit ? "Guardar cambios" : "Publicar reseña")}
      </button>
    </form>
  );
}
