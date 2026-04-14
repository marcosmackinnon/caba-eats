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
        options: {
          data: { full_name: name.trim() },
        },
      });

      setSubmitting(false);

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Con confirm email activado: mostrar pantalla de "revisá tu casilla"
      setStep("check-email");
      return;
    }

    // Login
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setErrorMsg("Todavía no confirmaste tu email. Revisá tu casilla de correo.");
      } else if (error.message.toLowerCase().includes("invalid login")) {
        setErrorMsg("Email o contraseña incorrectos.");
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    router.push("/");
    router.refresh();
  }

  // Pantalla post-registro
  if (step === "check-email") {
    return (
      <div className="rounded-[30px] border border-[#f0dccd] bg-white/92 p-6 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0e6] text-2xl">
            ✉️
          </div>
          <h2 className="text-xl font-semibold text-stone-900">
            Revisá tu casilla
          </h2>
          <p className="text-sm leading-6 text-stone-600">
            Te mandamos un email a <span className="font-semibold text-stone-800">{email}</span>.
            Hacé clic en el link para confirmar tu cuenta y empezar a usar la app.
          </p>
          <p className="text-xs text-stone-400">
            Si no lo ves, revisá la carpeta de spam.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setMode("login"); setStep("form"); }}
          className="mt-6 w-full rounded-full border border-[#f0dccd] bg-white px-5 py-3 text-sm font-semibold text-stone-700"
        >
          Ya confirmé, quiero ingresar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[30px] border border-[#f0dccd] bg-white/92 p-5 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-8">
      {/* Tabs */}
      <div className="flex gap-2 rounded-full bg-[#fff7f1] p-1">
        <button
          type="button"
          onClick={() => { setMode("register"); setErrorMsg(null); }}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            mode === "register"
              ? "bg-[#f27a3f] text-white shadow-[0_12px_25px_rgba(242,122,63,0.22)]"
              : "text-stone-500"
          }`}
        >
          Crear cuenta
        </button>
        <button
          type="button"
          onClick={() => { setMode("login"); setErrorMsg(null); }}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            mode === "login"
              ? "bg-[#f27a3f] text-white shadow-[0_12px_25px_rgba(242,122,63,0.22)]"
              : "text-stone-500"
          }`}
        >
          Ya tengo cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#ead7c9] bg-[#fffaf6] px-4 py-3 text-sm text-stone-700 outline-none focus:border-[#f27a3f]"
              placeholder="¿Cómo te llamás?"
            />
          </label>
        )}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-[#ead7c9] bg-[#fffaf6] px-4 py-3 text-sm text-stone-700 outline-none focus:border-[#f27a3f]"
            placeholder="tuemail@mail.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-2xl border border-[#ead7c9] bg-[#fffaf6] px-4 py-3 text-sm text-stone-700 outline-none focus:border-[#f27a3f]"
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {errorMsg && (
          <div className="rounded-2xl border border-[#f4cfb7] bg-[#fff7f1] px-4 py-3 text-sm text-stone-600">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[#f27a3f] px-5 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(242,122,63,0.25)] disabled:opacity-60"
        >
          {submitting
            ? "Procesando..."
            : mode === "register"
            ? "Crear cuenta"
            : "Entrar"}
        </button>
      </form>

      {mode === "register" && (
        <p className="mt-5 text-center text-xs leading-5 text-stone-400">
          Al crear tu cuenta aceptás que usemos tu información para mejorar tus recomendaciones.
        </p>
      )}
    </div>
  );
}
