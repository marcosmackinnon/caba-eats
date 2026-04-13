"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { CuisineOption } from "@/data/cuisines";

export default function CuisinePicker({
  options,
  selectedPlan,
}: {
  options: CuisineOption[];
  selectedPlan: string;
}) {
  const [query, setQuery] = useState("");

  const highlighted = useMemo(
    () => options.filter((option) => option.highlight),
    [options],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return options.filter((option) => {
      if (option.highlight) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        option.title.toLowerCase().includes(normalizedQuery) ||
        option.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [options, query]);

  const totalOptions = options.filter((option) => !option.highlight).length;

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-[#f0dccd] bg-white/88 p-4 shadow-[0_16px_45px_rgba(201,97,36,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
              Opciones rápidas
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Si querés resolver sin pensar tanto, arrancá por acá.
            </p>
          </div>
          <span className="rounded-full bg-[#fff1e7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#c96124]">
            2 atajos
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {highlighted.map((option) => (
            <Link
              key={option.title}
              href={`/preferencias?plan=${encodeURIComponent(
                selectedPlan,
              )}&cuisine=${encodeURIComponent(option.title)}`}
              className="group rounded-[20px] border border-[#f0dccd] bg-[#fffaf6] p-3 transition duration-200 hover:-translate-y-1 hover:border-[#f2b48a] hover:bg-white hover:shadow-[0_18px_40px_rgba(201,97,36,0.1)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff1e7] text-xl">
                  <span aria-hidden="true">{option.emoji}</span>
                </div>
                <span className="text-sm text-stone-300 transition group-hover:text-[#f27a3f]">
                  →
                </span>
              </div>

              <h2 className="mt-3 text-[15px] font-semibold leading-tight tracking-[-0.03em] text-stone-900">
                {option.title}
              </h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {option.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#f0dccd] bg-white/88 p-4 shadow-[0_16px_45px_rgba(201,97,36,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
              Elegí una cocina
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Mientras más sumemos, más cómodo te va a quedar buscar por acá.
            </p>
          </div>
          <span className="rounded-full bg-[#fff1e7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#c96124]">
            {totalOptions} opciones
          </span>
        </div>

        <label className="mt-4 block">
          <span className="sr-only">Buscar tipo de comida</span>
          <div className="flex items-center gap-3 rounded-2xl border border-[#ecd9cc] bg-[#fffaf6] px-4 py-3">
            <span aria-hidden="true" className="text-base text-stone-400">
              🔎
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar cocina o estilo"
              className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
            />
          </div>
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filteredOptions.map((option) => (
            <Link
              key={option.title}
              href={`/preferencias?plan=${encodeURIComponent(
                selectedPlan,
              )}&cuisine=${encodeURIComponent(option.title)}`}
              className="group rounded-[20px] border border-[#f0dccd] bg-white p-3 transition duration-200 hover:-translate-y-1 hover:border-[#f2b48a] hover:shadow-[0_18px_40px_rgba(201,97,36,0.1)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff1e7] text-xl">
                  <span aria-hidden="true">{option.emoji}</span>
                </div>
                <span className="text-sm text-stone-300 transition group-hover:text-[#f27a3f]">
                  →
                </span>
              </div>

              <h2 className="mt-3 text-[15px] font-semibold leading-tight text-stone-900">
                {option.title}
              </h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {option.description}
              </p>
            </Link>
          ))}
        </div>

        {filteredOptions.length === 0 ? (
          <div className="mt-4 rounded-[20px] border border-dashed border-[#ebd7ca] bg-[#fffaf6] px-4 py-5 text-sm text-stone-500">
            No encontramos una cocina con ese nombre todavía. Probá con otra
            búsqueda o seguí con <strong>Sin preferencia</strong>.
          </div>
        ) : null}
      </div>
    </div>
  );
}
