"use client";

import { useCallback, useEffect, useState } from "react";

interface RestaurantGalleryProps {
  /** URLs de las fotos a mostrar (se recomienda ~4) */
  images: string[];
  /** Nombre del restaurante para los alt */
  name: string;
  /** Clase del gradiente de fallback si una foto no carga */
  fallbackClassName: string;
}

function GalleryImage({
  src,
  alt,
  fallbackClassName,
  className,
}: {
  src: string;
  alt: string;
  fallbackClassName: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className} ${fallbackClassName}`}>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function RestaurantGallery({
  images,
  name,
  fallbackClassName,
}: RestaurantGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const goPrev = useCallback(
    () => setOpenIndex((i) => (i == null ? i : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const goNext = useCallback(
    () => setOpenIndex((i) => (i == null ? i : (i + 1) % images.length)),
    [images.length],
  );

  // Navegación por teclado y bloqueo de scroll mientras el visor está abierto
  useEffect(() => {
    if (openIndex == null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, goPrev, goNext]);

  if (images.length === 0) return null;

  return (
    <article className="rounded-[30px] border border-[#f0dccd] bg-white p-5 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
          Fotos del lugar
        </p>
        <span className="rounded-full bg-[#fff1e7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#c96124]">
          {images.length} fotos
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {images.map((src, index) => (
          <button
            key={src + index}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group block aspect-[4/3] overflow-hidden rounded-[18px] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(201,97,36,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f27a3f]"
            aria-label={`Ver foto ${index + 1} de ${name}`}
          >
            <GalleryImage
              src={src}
              alt={`${name} — foto ${index + 1}`}
              fallbackClassName={fallbackClassName}
              className="h-full w-full transition duration-300 group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      {/* Visor / lightbox */}
      {openIndex != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${name}`}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl text-stone-800 shadow-lg"
            aria-label="Cerrar"
          >
            ✕
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-2xl text-stone-800 shadow-lg sm:left-6"
              aria-label="Foto anterior"
            >
              ‹
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[openIndex]}
            alt={`${name} — foto ${openIndex + 1}`}
            className="max-h-[82vh] max-w-[92vw] rounded-[20px] object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            decoding="async"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-2xl text-stone-800 shadow-lg sm:right-6"
              aria-label="Foto siguiente"
            >
              ›
            </button>
          )}

          <span className="absolute bottom-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700">
            {openIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </article>
  );
}
