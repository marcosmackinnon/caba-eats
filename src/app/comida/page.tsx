import Link from "next/link";

import AppNavigation from "@/components/AppNavigation";
import CuisinePicker from "@/app/comida/CuisinePicker";
import { cuisineOptions } from "@/data/cuisines";

type SearchParams = Promise<{
  plan?: string;
}>;

export default async function ComidaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedPlan = params.plan ?? "Con amigos";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] pb-28 text-stone-900 md:pb-0">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-10 sm:py-6 lg:px-12">
        <header className="flex items-center justify-between">
          <Link
            href="/plan"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ead7c9] bg-white/90 text-lg text-stone-700 shadow-[0_12px_35px_rgba(201,97,36,0.08)]"
            aria-label="Volver al paso anterior"
          >
            ←
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <AppNavigation />
            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-stone-600 shadow-[0_12px_35px_rgba(201,97,36,0.08)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f27a3f]" />
              Paso 2 de 4
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-12">
          <div className="space-y-4 lg:pt-8">
            <div className="overflow-hidden rounded-[24px] bg-[#f27a3f] p-4 text-white shadow-[0_18px_45px_rgba(201,97,36,0.18)] sm:rounded-[30px] sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/14 px-3 py-2 text-sm font-medium text-white/90">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    Definamos el antojo
                  </div>
                  <span className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/88">
                    Paso 2
                  </span>
                </div>

                <h1 className="max-w-lg text-3xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                  ¿Qué te gustaría comer?
                </h1>
                <p className="max-w-xl text-sm leading-6 text-white/82 sm:text-base sm:leading-7">
                  Elegí una cocina o usá una opción rápida para seguir sin perder tiempo.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/18 px-3 py-1.5 text-sm font-medium">
                    {selectedPlan}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <CuisinePicker options={cuisineOptions} selectedPlan={selectedPlan} />
        </section>
      </section>
    </main>
  );
}
