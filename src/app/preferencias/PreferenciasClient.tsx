"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AppNavigation from "@/components/AppNavigation";
import { getNearestNeighborhoodLabel, isWithinCABA } from "@/data/restaurants";

const vibeOptions = [
  "Tranquilo",
  "Lindo",
  "Romántico",
  "Rápido",
  "Especial",
  "Social",
];

const anyVibeLabel = "Me da igual";

const neighborhoods = [
  "Palermo",
  "Recoleta",
  "Belgrano",
  "Chacarita",
  "Villa Crespo",
  "Colegiales",
  "San Telmo",
  "Almagro",
  "Caballito",
  "Puerto Madero",
  "Centro",
  "Retiro",
  "Monserrat",
  "Boedo",
  "Flores",
  "Villa Urquiza",
  "Núñez",
  "Saavedra",
  "Coghlan",
  "La Boca",
];

type LocationState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "gps"; lat: number; lng: number; label: string }
  | { type: "manual"; zone: string }
  | { type: "error"; message: string };

export default function PreferenciasClient({
  selectedPlan,
  selectedCuisine,
  initialBudget,
  initialDistance,
  initialVibes,
  initialLocation,
}: {
  selectedPlan: string;
  selectedCuisine: string;
  initialBudget: number;
  initialDistance: number;
  initialVibes: string[];
  initialLocation: LocationState;
}) {
  const router = useRouter();
  const [budget, setBudget] = useState(initialBudget);
  const [distance, setDistance] = useState(initialDistance);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(initialVibes);
  const [showDistance, setShowDistance] = useState(false);
  const [location, setLocation] = useState<LocationState>(initialLocation);

  function requestGPS() {
    if (!navigator.geolocation) {
      setLocation({ type: "error", message: "Tu navegador no soporta geolocalización." });
      return;
    }
    setLocation({ type: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isWithinCABA(latitude, longitude)) {
          setLocation({
            type: "error",
            message: "Tu ubicación está fuera de CABA. Esta app solo funciona dentro de la ciudad.",
          });
          return;
        }
        // Reverse-geocode simple: encontrar el barrio más cercano por coordenadas fijas
        const label = getNearestNeighborhoodLabel(latitude, longitude);
        setLocation({ type: "gps", lat: latitude, lng: longitude, label });
      },
      (err) => {
        if (err.code === 1) {
          setLocation({ type: "error", message: "Permiso de ubicación denegado. Elegí un barrio manualmente." });
        } else {
          setLocation({ type: "error", message: "No pudimos obtener tu ubicación. Elegí un barrio manualmente." });
        }
      },
      { timeout: 8000 }
    );
  }

  function selectManualZone(zone: string) {
    setLocation({ type: "manual", zone });
  }

  function toggleVibe(option: string) {
    setSelectedVibes((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  function activateAnyVibe() {
    setSelectedVibes([]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams({
      plan: selectedPlan,
      cuisine: selectedCuisine,
      vibe: selectedVibes.join(","),
      budget: String(budget),
      distance: String(distance),
    });

    if (location.type === "gps") {
      params.set("userLat", String(location.lat));
      params.set("userLng", String(location.lng));
      params.set("userLabel", location.label);
    } else {
      const zone = location.type === "manual" ? location.zone : "Palermo";
      params.set("zone", zone);
    }

    router.push(`/resultados?${params.toString()}`);
  }

  const locationLabel =
    location.type === "gps"
      ? location.label
      : location.type === "manual"
      ? location.zone
      : null;

  const showNeighborhoodPicker =
    location.type === "idle" ||
    location.type === "manual" ||
    location.type === "error";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] px-4 py-4 pb-28 text-stone-900 sm:px-10 sm:py-6 md:pb-0 lg:px-12">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href={`/comida?plan=${encodeURIComponent(selectedPlan)}`}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ead7c9] bg-white/90 text-lg text-stone-700 shadow-[0_12px_35px_rgba(201,97,36,0.08)]"
            aria-label="Volver al paso anterior"
          >
            ←
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <AppNavigation />
            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-stone-600 shadow-[0_12px_35px_rgba(201,97,36,0.08)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f27a3f]" />
              Paso 3 de 4
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:py-12">
          <div className="space-y-4 lg:pt-4">
            <div className="overflow-hidden rounded-[24px] bg-[#f27a3f] p-4 text-white shadow-[0_18px_45px_rgba(201,97,36,0.18)] sm:rounded-[30px] sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/14 px-3 py-2 text-sm font-medium text-white/90">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    Ajustemos la búsqueda
                  </div>
                  <span className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/88">
                    Paso 3
                  </span>
                </div>

                <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                  Presupuesto, zona y estilo.
                </h1>
                <p className="max-w-xl text-sm leading-6 text-white/82 sm:text-base sm:leading-7">
                  Ajustá lo importante para que te devolvamos pocas opciones, pero mucho más precisas dentro de CABA.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/18 px-3 py-1.5 text-sm font-medium">
                    {selectedPlan}
                  </span>
                  <span className="rounded-full bg-white/18 px-3 py-1.5 text-sm font-medium">
                    {selectedCuisine === "Sin preferencia" ? "Cualquier comida" : selectedCuisine}
                  </span>
                  {locationLabel && (
                    <span className="rounded-full bg-white/18 px-3 py-1.5 text-sm font-medium">
                      📍 {locationLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[28px] border border-[#f0dccd] bg-white/92 p-4 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:rounded-[36px] sm:p-8"
          >
            {/* ── ZONA / UBICACIÓN ── */}
            <div className="space-y-3 rounded-[24px] border border-[#f0dccd] bg-[#fffaf6] p-4 sm:rounded-[28px] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-stone-700">Zona</span>
                {locationLabel && (
                  <span className="rounded-full bg-[#fff1e7] px-3 py-1.5 text-sm font-semibold text-[#c96124]">
                    {location.type === "gps" ? "📍 " : ""}{locationLabel}
                  </span>
                )}
              </div>

              {/* Botón GPS */}
              {location.type !== "gps" && (
                <button
                  type="button"
                  onClick={requestGPS}
                  disabled={location.type === "loading"}
                  className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#f27a3f] bg-[#fff6f0] px-4 py-3 text-sm font-semibold text-[#c96124] transition hover:bg-[#fff1e7] disabled:opacity-60"
                >
                  {location.type === "loading" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f27a3f] border-t-transparent" />
                      Obteniendo ubicación…
                    </>
                  ) : (
                    <>
                      📍 Usar mi ubicación actual
                    </>
                  )}
                </button>
              )}

              {/* GPS confirmado */}
              {location.type === "gps" && (
                <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#d4edda] bg-[#f0faf2] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#2d6a3f]">
                    <span>✓</span>
                    <span>Ubicación detectada — {location.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocation({ type: "idle" })}
                    className="text-xs text-stone-400 underline"
                  >
                    Cambiar
                  </button>
                </div>
              )}

              {/* Error */}
              {location.type === "error" && (
                <div className="rounded-[18px] border border-[#fde8d8] bg-[#fff6f0] px-4 py-3 text-sm text-[#c96124]">
                  {location.message}
                </div>
              )}

              {/* Chips de barrio (cuando no hay GPS) */}
              {showNeighborhoodPicker && (
                <div className="space-y-2">
                  <p className="text-xs text-stone-400">
                    {location.type === "error" ? "Elegí un barrio:" : "O elegí un barrio manualmente:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {neighborhoods.map((option) => {
                      const isSelected =
                        location.type === "manual" && location.zone === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => selectManualZone(option)}
                          className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                            isSelected
                              ? "bg-[#f27a3f] text-white shadow-[0_8px_20px_rgba(242,122,63,0.25)]"
                              : "border border-[#ead7c9] bg-white text-stone-600 hover:border-[#f2b48a]"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── PRESUPUESTO ── */}
            <label className="block space-y-3 rounded-[24px] border border-[#f0dccd] bg-[#fffaf6] p-4 sm:rounded-[28px] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-stone-700">
                  Presupuesto por persona
                </span>
                <span className="rounded-full bg-[#fff1e7] px-3 py-1.5 text-sm font-semibold text-[#c96124]">
                  ${budget.toLocaleString("es-AR")}
                </span>
              </div>
              <input
                type="range"
                min="8000"
                max="80000"
                step="1000"
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value))}
                className="w-full accent-[#f27a3f]"
              />
              <div className="flex justify-between text-xs text-stone-400">
                <span>$8.000</span>
                <span>$80.000</span>
              </div>
            </label>

            {/* ── DISTANCIA ── */}
            <div className="rounded-[24px] border border-[#f0dccd] bg-[#fffaf6] p-4 sm:rounded-[28px] sm:p-5">
              <button
                type="button"
                onClick={() => setShowDistance((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3"
              >
                <span className="text-sm font-semibold text-stone-700">
                  {location.type === "gps" ? "Radio desde tu ubicación" : "Distancia máxima"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#fff1e7] px-3 py-1.5 text-sm font-semibold text-[#c96124]">
                    {distance} km
                  </span>
                  <span className="text-xs text-stone-400">
                    {showDistance ? "▲" : "▼"}
                  </span>
                </div>
              </button>
              {showDistance && (
                <div className="mt-4 space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={distance}
                    onChange={(event) => setDistance(Number(event.target.value))}
                    className="w-full accent-[#f27a3f]"
                  />
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>1 km</span>
                    <span>15 km</span>
                  </div>
                  {location.type === "gps" && (
                    <p className="text-xs text-stone-400">
                      El radio se mide desde tu posición exacta.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── VIBRA ── */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-stone-700">
                ¿Qué priorizás en el lugar?
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {vibeOptions.map((option) => {
                  const isSelected = selectedVibes.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleVibe(option)}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition sm:px-4 ${
                        isSelected
                          ? "bg-[#f27a3f] text-white shadow-[0_12px_30px_rgba(242,122,63,0.25)]"
                          : "border border-[#ead7c9] bg-white text-stone-600 hover:border-[#f2b48a]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={activateAnyVibe}
                  className={`min-w-40 rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedVibes.length === 0
                      ? "bg-[#f27a3f] text-white shadow-[0_12px_30px_rgba(242,122,63,0.25)]"
                      : "border border-[#ead7c9] bg-white text-stone-600 hover:border-[#f2b48a]"
                  }`}
                >
                  {anyVibeLabel}
                </button>
              </div>
            </fieldset>

            <div className="flex flex-col gap-3 border-t border-[#f3e3d7] pt-4 sm:flex-row sm:pt-5">
              <Link
                href={`/comida?plan=${encodeURIComponent(selectedPlan)}`}
                className="rounded-full border border-[#e8d6c8] bg-white px-6 py-3.5 text-center text-base font-semibold text-stone-700"
              >
                Volver
              </Link>
              <button
                type="submit"
                className="rounded-full bg-[#f27a3f] px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(242,122,63,0.25)]"
              >
                Ver resultados
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
