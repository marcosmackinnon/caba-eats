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
  initialComidaRating?: number | null;
  initialServicioRating?: number | null;
  initialAmbienteRating?: number | null;
  initialNoiseLevel?: string | null;
  initialGroupType?: string | null;
};

const NOISE_OPTIONS = ["Tranquilo", "Moderado", "Animado"];
const GROUP_OPTIONS = ["Solo", "En pareja", "Con amigos", "En familia"];
const SUB_LABELS = ["Comida", "Servicio", "Ambiente"] as const;

function MiniStarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;
  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          aria-label={`${star} estrellas`}
          className="p-0.5"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
            <path
              fill={display >= star ? "#f27a3f" : "#e5e7eb"}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === opt ? null : opt)}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            value === opt
              ? "border-[#f27a3f] bg-[#fff1e7] text-[#c96124]"
              : "border-stone-200 bg-white text-stone-600 hover:border-[#f2b48a]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm({
  restaurantSlug,
  restaurantName,
  onSuccess,
  reviewId,
  initialRating = 0,
  initialBody = "",
  initialPhotoUrl,
  initialComidaRating = null,
  initialServicioRating = null,
  initialAmbienteRating = null,
  initialNoiseLevel = null,
  initialGroupType = null,
}: Props) {
  const isEdit = Boolean(reviewId);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [rating, setRating] = useState(initialRating);
  const [body, setBody] = useState(initialBody);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl ?? null);
  const [comidaRating, setComidaRating] = useState(initialComidaRating ?? 0);
  const [servicioRating, setServicioRating] = useState(initialServicioRating ?? 0);
  const [ambienteRating, setAmbienteRating] = useState(initialAmbienteRating ?? 0);
  const [noiseLevel, setNoiseLevel] = useState<string | null>(initialNoiseLevel ?? null);
  const [groupType, setGroupType] = useState<string | null>(initialGroupType ?? null);
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
    if (rating === 0) { setError("Elegí un puntaje general."); return; }
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
      comida_rating: comidaRating || null,
      servicio_rating: servicioRating || null,
      ambiente_rating: ambienteRating || null,
      noise_level: noiseLevel,
      group_type: groupType,
    };

    if (isEdit) {
      const { error: err } = await supabase.from("reviews").update(payload).eq("id", reviewId);
      if (err) { setError("No se pudo guardar el cambio."); setSubmitting(false); return; }
    } else {
      const { error: err } = await supabase.from("reviews").insert({ user_id: user.id, restaurant_slug: restaurantSlug, ...payload });
      if (err) { setError("No se pudo guardar la reseña."); setSubmitting(false); return; }
    }

    setSubmitting(false);
    onSuccess();
  }

  const ratingLabel = rating === 0 ? "" : rating <= 1 ? "Muy malo" : rating <= 2 ? "Malo" : rating <= 3 ? "Regular" : rating <= 4 ? "Bueno" : "Excelente";
  const subVals = [comidaRating, servicioRating, ambienteRating];
  const subSetters = [setComidaRating, setServicioRating, setAmbienteRating];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 1 · Puntaje general */}
      <div>
        <p className="mb-2 text-sm font-semibold text-stone-800">
          Puntaje general <span className="text-[#f27a3f]">*</span>
        </p>
        <StarPicker value={rating} onChange={setRating} disabled={submitting} />
        {ratingLabel && (
          <p className="mt-1.5 text-xs font-medium text-[#c96124]">{ratingLabel}</p>
        )}
      </div>

      {/* 2 · Sub-ratings */}
      <div className="rounded-[18px] border border-stone-100 bg-stone-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          Detalles <span className="ml-1 font-normal normal-case tracking-normal text-stone-300">· opcional</span>
        </p>
        <div className="space-y-3">
          {SUB_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-20 text-sm font-medium text-stone-700">{label}</span>
              <MiniStarPicker value={subVals[i]} onChange={subSetters[i]} disabled={submitting} />
              {subVals[i] > 0 && (
                <span className="text-xs font-semibold text-[#c96124]">{subVals[i]}/5</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3 · Foto */}
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

      {/* 4 · Ambiente */}
      <div>
        <p className="mb-2.5 text-sm font-semibold text-stone-800">
          ¿Cómo era el ambiente? <span className="text-xs font-normal text-stone-400">· opcional</span>
        </p>
        <ChipGroup options={NOISE_OPTIONS} value={noiseLevel} onChange={setNoiseLevel} disabled={submitting} />
      </div>

      {/* 5 · Con quién */}
      <div>
        <p className="mb-2.5 text-sm font-semibold text-stone-800">
          ¿Fuiste con...? <span className="text-xs font-normal text-stone-400">· opcional</span>
        </p>
        <ChipGroup options={GROUP_OPTIONS} value={groupType} onChange={setGroupType} disabled={submitting} />
      </div>

      {/* 6 · Comentario */}
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
