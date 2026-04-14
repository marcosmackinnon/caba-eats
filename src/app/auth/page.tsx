import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        {/* Logo / marca */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-[-0.04em] text-stone-900">
            caba<span className="text-[#f27a3f]">eats</span>
          </span>
        </div>

        <AuthForm />
      </div>
    </main>
  );
}
