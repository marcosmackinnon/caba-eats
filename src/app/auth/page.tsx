import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf4_0%,_#fff4e8_100%)] px-4 py-6 pb-28 text-stone-900 sm:px-10 lg:px-12">
      <section className="mx-auto grid min-h-screen w-full max-w-5xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f4cfb7] bg-white/80 px-3 py-2 text-sm font-medium text-stone-600">
            <span className="h-2 w-2 rounded-full bg-[#f27a3f]" />
            Tu cuenta
          </div>
          <h1 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
            Guardá tus favoritos y empezá a personalizar en serio.
          </h1>
          <p className="max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            Con tu cuenta vamos a poder recordar qué te gusta, qué buscás y qué
            lugares venís guardando para mejorar las recomendaciones.
          </p>
        </div>

        <AuthForm />
      </section>
    </main>
  );
}
