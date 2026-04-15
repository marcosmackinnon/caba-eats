"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";
type Step = "form" | "check-email";

export default function AuthForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<Mode>("register");
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } },
      });
      setSubmitting(false);
      if (error) { setErrorMsg(error.message); return; }
      setStep("check-email");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setErrorMsg(
        error.message.toLowerCase().includes("email not confirmed")
          ? "Confirmá tu email antes de ingresar."
          : "Email o contraseña incorrectos."
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  // Pantalla post-registro
  if (step === "check-email") {
    return (
      <div className="text-center space-y-5">
        <p className="text-xl font-semibold text-stone-900">Revisá tu casilla</p>
        <p className="text-sm text-stone-500 leading-6">
          Te enviamos un link a{" "}
          <span className="font-medium text-stone-700">{email}</span>{" "}
          para confirmar tu cuenta.
        </p>
        <button
          type="button"
          onClick={() => { setMode("login"); setStep("form"); }}
          className="w-full rounded-2xl bg-[#f27a3f] py-4 text-sm font-semibold text-white"
        >
          Ya confirmé, ingresar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-stone-100 p-1">
        <button
          type="button"
          onClick={() => { setMode("register"); setErrorMsg(null); }}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            mode === "register" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
          }`}
        >
          Crear cuenta
        </button>
        <button
          type="button"
          onClick={() => { setMode("login"); setErrorMsg(null); }}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            mode === "login" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
          }`}
        >
          Iniciar sesión
        </button>
      </div>

      {/* Campos */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "register" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nombre"
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-800 outline-none focus:border-[#f27a3f] focus:bg-white placeholder:text-stone-400 transition"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-800 outline-none focus:border-[#f27a3f] focus:bg-white placeholder:text-stone-400 transition"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="Contraseña"
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-800 outline-none focus:border-[#f27a3f] focus:bg-white placeholder:text-stone-400 transition"
        />

        {errorMsg && (
          <p className="text-xs text-red-500 px-1 pt-1">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-[#f27a3f] py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(242,122,63,0.3)] disabled:opacity-50 mt-2"
        >
          {submitting
            ? "Procesando..."
            : mode === "register" ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      {mode === "register" && (
        <p className="text-center text-xs text-stone-400">
          Solo necesitás registrarte una vez.
        </p>
      )}
    </div>
  );
}
