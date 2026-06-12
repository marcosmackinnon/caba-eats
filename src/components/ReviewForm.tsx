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
  // Edit mode
  reviewId?: string;
  initialRating?: number;
  initialBody?: string;
  initialPhotoUrl?: string;
};

export default function ReviewForm({
  restaurantSlug,
  restaurantName,
  onSuccess,
  reviewId,
  initialRating = 0,
  initialBody = "",
  initialPhotoUrl,
}: Props) {
  const isEdit = Boolean(reviewId);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [rating, setRating] = useState(initialRating);
  const [body, setBody] = useState(initialBody);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl ?? null);
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

      if (uploadError) {
        setError(`No se pudo subir la foto: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(path);
      photoUrl = urlData.publicUrl;
    }

    if (isEdit) {
      const { error: updateError } = await supabase
        .from("reviews")
        .update({ rating, body: body.trim() || null, photo_url: photoUrl })
        .eq("id", reviewId);

      if (updateError) {
        setError("No se pudo guardar el cambio. Intentá de nuevo.");
        setSubmitting(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("reviews").insert({
        user_id: user.id,
        restaurant_slug: restaurantSlug,
        rating,
        body: body.trim() || null,
        photo_url: photoUrl,
      });

      if (insertError) {
        setError("No se pudo guardar la reseña. Intentá de nuevo.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-stone-700">Puntaje *</p>
        <StarPicker value={rating} onChange={setRating} disabled={submitting} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-stone-700">
          Foto de tu visita{" "}
          {!isEdit && <span className="text-[#f27a3f]">*</span>}
          {isEdit && <span className="text-xs font-normal text-stone-400">(opcional — dejá vacío para mantener la actual)</span>}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
          disabled={submitting}
        />
        {photoPreview ? (
          <div className="relative">
            <div className="relative h-44 w-full overflow-hidden rounded-2xl">
              <Image src={photoPreview} alt="Vista previa" fill className="object-cover" />
            </div>
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoPreview(initialPhotoUrl ?? null); if (fileRef.current) fileRef.current.value = ""; }}
              className="mt-2 text-xs text-stone-400 underline"
            >
              Cambiar foto
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={submitting}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#f0dccd] bg-[#fff8f2] py-8 text-sm font-medium text-stone-500 transition hover:border-[#f27a3f] hover:text-[#c96124]"
          >
            <span className="text-2xl">📷</span>
            Subir foto de tu visita
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-stone-700">
          Comentario <span className="text-stone-400 font-normal">(opcional)</span>
        </p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder={`¿Qué te pareció ${restaurantName}?`}
          disabled={submitting}
          className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none focus:border-[#f27a3f] focus:bg-white placeholder:text-stone-400 transition"
        />
        <p className="mt-1 text-right text-xs text-stone-400">{body.length}/500</p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting || rating === 0 || (!isEdit && !photoFile)}
        className="w-full rounded-full bg-[#f27a3f] py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(242,122,63,0.3)] disabled:opacity-50 transition"
      >
        {submitting ? (isEdit ? "Guardando..." : "Publicando...") : (isEdit ? "Guardar cambios" : "Publicar reseña")}
      </button>
    </form>
  );
}
