"use client";

import { useState } from "react";

type Props = {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
};

export default function StarPicker({ value, onChange, disabled }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const display = hovered ?? value;

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(null)}
      role="radiogroup"
      aria-label="Puntaje"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="relative flex">
          {/* mitad izquierda — 0.5 */}
          <button
            type="button"
            disabled={disabled}
            aria-label={`${star - 0.5} estrellas`}
            className="absolute left-0 top-0 h-full w-1/2 z-10"
            onMouseEnter={() => setHovered(star - 0.5)}
            onClick={() => onChange(star - 0.5)}
          />
          {/* mitad derecha — 1 */}
          <button
            type="button"
            disabled={disabled}
            aria-label={`${star} estrellas`}
            className="absolute right-0 top-0 h-full w-1/2 z-10"
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
          />

          {/* Estrella visual */}
          <svg
            viewBox="0 0 20 20"
            className="h-8 w-8 select-none"
            aria-hidden
          >
            <defs>
              <linearGradient id={`star-grad-${star}`} x1="0" x2="1" y1="0" y2="0">
                {/* lleno hasta donde corresponde */}
                {display >= star ? (
                  <>
                    <stop offset="100%" stopColor="#f27a3f" />
                    <stop offset="100%" stopColor="#e5e7eb" />
                  </>
                ) : display >= star - 0.5 ? (
                  <>
                    <stop offset="50%" stopColor="#f27a3f" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#e5e7eb" />
                    <stop offset="100%" stopColor="#e5e7eb" />
                  </>
                )}
              </linearGradient>
            </defs>
            <path
              fill={`url(#star-grad-${star})`}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </span>
      ))}

      {display > 0 && (
        <span className="ml-2 text-sm font-semibold text-[#c96124]">
          {display.toFixed(1)}
        </span>
      )}
    </div>
  );
}
