import Link from "next/link";

import AppNavigation from "@/components/AppNavigation";

const planOptions = [
  {
    title: "Cita",
    description: "Lindo, íntimo y más especial.",
    emoji: "💘",
  },
  {
    title: "Con amigos",
    description: "Social, fácil y para compartir.",
    emoji: "🍻",
  },
  {
    title: "En familia",
    description: "Cómodo, variado y sin vueltas.",
    emoji: "👨‍👩‍👧‍👦",
  },
  {
    title: "Algo rápido",
    description: "Resolver la salida en poco tiempo.",
    emoji: "⚡",
  },
  {
    title: "Salida especial",
    description: "Planazo para una ocasión distinta.",
    emoji: "✨",
  },
  {
    title: "No sé todavía",
    description: "Te ayudamos a descubrir.",
    emoji: "🤝",
  },
];

export default function PlanPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] pb-28 text-stone-900 md:pb-0">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-10 sm:py-6 lg:px-12">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead7c9] bg-white/90 text-lg text-stone-700 shadow-[0_12px_35px_rgba(201,97,36,0.08)]"
            aria-label="Volver al inicio"
          >
            ←
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <AppNavigation />
            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-stone-600 shadow-[0_12px_35px_rgba(201,97,36,0.08)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f27a3f]" />
              Paso 1 de 4
            </div>
          </div>
        </header>

        <section className="space-y-4 py-4 sm:space-y-6 sm:py-6">
          <div className="overflow-hidden rounded-[30px] bg-[#f27a3f] p-4 text-white shadow-[0_24px_60px_rgba(201,97,36,0.2)] sm:rounded-[34px] sm:p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    Buenos Aires, AR
                  </p>
                  <p className="mt-1 text-xs font-medium text-white/85 sm:text-sm">
                    Elegí tu contexto primero
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-lg sm:h-12 sm:w-12 sm:text-xl">
                  <span aria-hidden="true">🍽️</span>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="max-w-xl text-3xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">
                  ¿Qué plan tenés hoy?
                </h1>
                <p className="max-w-xl text-sm leading-6 text-white/82 sm:text-lg sm:leading-7">
                  Elegí el tipo de salida y seguimos con comida, presupuesto y zona.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-white/22 px-3 py-1.5 font-medium">
                  4 pasos rápidos
                </span>
                <span className="rounded-full bg-white/14 px-3 py-1.5 text-white/80">
                  Solo lo necesario
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#f0dccd] bg-white/88 p-4 shadow-[0_16px_45px_rgba(201,97,36,0.08)] sm:rounded-[30px] sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Elegí el plan
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Tocá una opción y seguimos con la comida.
                </p>
              </div>
              <span className="rounded-full bg-[#fff1e7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#c96124]">
                6 opciones
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {planOptions.map((option) => (
                <Link
                  key={option.title}
                  href={`/comida?plan=${encodeURIComponent(option.title)}`}
                  className="group rounded-[20px] border border-[#f0dccd] bg-[#fffaf6] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#f2b48a] hover:bg-white hover:shadow-[0_18px_35px_rgba(201,97,36,0.1)] sm:rounded-[24px] sm:p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff1e7] text-xl sm:h-11 sm:w-11 sm:text-2xl">
                      <span aria-hidden="true">{option.emoji}</span>
                    </div>
                    <span className="text-sm text-stone-300 transition group-hover:text-[#f27a3f] sm:text-lg">
                      →
                    </span>
                  </div>

                  <h2 className="mt-3 text-base font-semibold leading-tight tracking-[-0.02em] text-stone-900 sm:mt-4 sm:text-lg">
                    {option.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-stone-500 sm:mt-2 sm:text-sm sm:leading-6">
                    {option.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
