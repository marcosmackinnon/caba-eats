import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] px-4 py-10 text-stone-900">
      <section className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:min-h-screen">

        {/* Header / branding */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f4cfb7] bg-white/80 px-3 py-2 text-sm font-medium text-stone-600">
            <span className="h-2 w-2 rounded-full bg-[#f27a3f]" />
            Buenos Aires · CABA
          </div>

          <h1 className="max-w-sm text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Encontrá dónde comer, cada vez mejor.
          </h1>

          <p className="max-w-sm text-base leading-7 text-stone-500">
            Creá tu cuenta una sola vez. A partir de ahí la app aprende qué te
            gusta y te da recomendaciones cada vez más personalizadas.
          </p>

          {/* Beneficios */}
          <ul className="space-y-3 pt-1">
            {[
              { icon: "❤️", text: "Guardá favoritos que se sincronizan en todos tus dispositivos" },
              { icon: "🎯", text: "Recomendaciones que mejoran con cada búsqueda" },
              { icon: "📍", text: "Historial de lugares que ya fuiste" },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-stone-600">
                <span className="mt-0.5 text-base">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Formulario */}
        <AuthForm />

      </section>
    </main>
  );
}
