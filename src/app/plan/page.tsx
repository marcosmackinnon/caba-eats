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
          <div className="overflow-hidden rounded-[30px] bg-[#f27a3f] px-5 py-7 text-white shadow-[0_24px_60px_rgba(201,97,36,0.2)] sm:rounded-[34px] sm:px-8 sm:py-10">
            <h1 className="text-3xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">
              ¿Qué plan tenés hoy?
            </h1>
          </div>

          <div className="rounded-[28px] border border-[#f0dccd] bg-white/88 p-4 shadow-[0_16px_45px_rgba(201,97,36,0.08)] sm:rounded-[30px] sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {planOptions.map((option) => (
                <Link
                  key={option.title}
                  href={`/comida?plan=${encodeURIComponent(option.title)}`}
                  className="group flex flex-col items-center justify-center gap-2 rounded-[20px] border border-[#f0dccd] bg-[#fffaf6] p-5 text-center transition duration-200 hover:-translate-y-0.5 hover:border-[#f2b48a] hover:bg-white hover:shadow-[0_18px_35px_rgba(201,97,36,0.1)] sm:rounded-[24px] sm:p-6"
                >
                  <span aria-hidden="true" className="text-3xl sm:text-4xl">
                    {option.emoji}
                  </span>
                  <h2 className="text-base font-semibold leading-tight tracking-[-0.02em] text-stone-900 sm:text-lg">
                    {option.title}
                  </h2>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
