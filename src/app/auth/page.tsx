import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] flex flex-col px-5">
      {/* Logo arriba */}
      <div className="pt-16 pb-12 text-center">
        <span className="text-5xl font-bold tracking-[-0.04em] text-stone-900">
          Don<span className="text-[#f27a3f]">dy</span>
        </span>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-sm mx-auto">
        <AuthForm />
      </div>
    </main>
  );
}
