import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">

      {/* Bloque superior — color de marca */}
      <div className="relative flex flex-col items-center justify-center bg-[#f27a3f] px-6 pt-20 pb-16">
        {/* Círculo decorativo de fondo */}
        <div className="absolute bottom-0 left-1/2 h-24 w-[140%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-white" />

        {/* Logo */}
        <span className="relative text-6xl font-bold tracking-[-0.04em] text-white">
          Don<span className="text-white/70">dy</span>
        </span>

        {/* Tagline */}
        <p className="relative mt-3 text-base font-medium text-white/80">
          Encontrá dónde comer, ya.
        </p>
      </div>

      {/* Bloque inferior — formulario */}
      <div className="flex flex-1 flex-col justify-center px-6 pt-12 pb-10">
        <AuthForm />
      </div>

    </main>
  );
}
