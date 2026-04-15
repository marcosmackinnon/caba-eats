import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">

      {/* Bloque superior — color de marca */}
      <div className="relative flex flex-col items-center justify-center bg-[#f27a3f] px-6 pt-24 pb-24">
        {/* Curva inferior */}
        <div className="absolute bottom-0 left-1/2 h-28 w-[150%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-white" />

        {/* Logo */}
        <span
          className="relative text-6xl font-bold tracking-[-0.04em] text-white"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
        >
          Dondy
        </span>

        {/* Tagline */}
        <p className="relative mt-3 text-base font-medium text-white/80">
          Encontrá dónde comer, ya.
        </p>
      </div>

      {/* Bloque inferior — formulario */}
      <div className="flex flex-1 flex-col justify-center px-6 pt-16 pb-10">
        <AuthForm />
      </div>

    </main>
  );
}
