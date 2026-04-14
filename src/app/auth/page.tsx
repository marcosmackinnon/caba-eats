import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] flex flex-col px-5">
      {/* Logo */}
      <div className="pt-28 pb-10 text-center">
        <span className="text-5xl font-bold tracking-[-0.04em] text-stone-900">
          Don<span className="text-[#f27a3f]">dy</span>
        </span>
      </div>

      {/* Formulario centrado en el espacio restante */}
      <div className="flex flex-1 items-center justify-center pb-10">
        <div className="w-full max-w-sm">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
