"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";
type Step = "form" | "check-email" | "forgot" | "forgot-sent";

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
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setNeedsConfirmation(false);

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
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setNeedsConfirmation(true);
        setErrorMsg("Todavía no confirmaste tu email.");
      } else {
        setErrorMsg("Email o contraseña incorrectos.");
      }
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleForgotPassword() {
    if (!email) { setErrorMsg("Ingresá tu email primero."); return; }
    setSubmitting(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      setErrorMsg("No se pudo enviar el email. Intentá de nuevo.");
    } else {
      setStep("forgot-sent");
    }
  }

  async function handleResend() {
    if (resendCooldown || !email) return;
    setResendCooldown(true);
    setResendMsg(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setResendMsg("No se pudo reenviar. Intentá de nuevo en unos minutos.");
    } else {
      setResendMsg("Email reenviado. Revisá tu casilla.");
    }
    // cooldown de 60 segundos
    setTimeout(() => setResendCooldown(false), 60000);
  }

  // Pantalla post-registro
  if (step === "check-email") {
    return (
      <div className="text-center space-y-5">
        <p className="text-xl font-semibold text-stone-900">Revisá tu casilla</p>
        <p className="text-sm text-stone-500 leading-6">
          Te enviamos un link a{" "}
          <span className="font-medium text-stone-700">{email}</span>.
          Tenés 1 hora para confirmarlo antes de que expire.
        </p>
        {resendMsg && (
          <p className="text-xs text-stone-500">{resendMsg}</p>
        )}
        <button
          type="button"
          onClick={() => { setMode("login"); setStep("form"); }}
          className="w-full rounded-2xl bg-[#f27a3f] py-4 text-sm font-semibold text-white"
        >
          Ya confirmé, ingresar
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown}
          className="w-full rounded-2xl border border-stone-200 py-3.5 text-sm font-medium text-stone-500 disabled:opacity-40"
        >
          {resendCooldown ? "Email enviado" : "Reenviar email de confirmación"}
        </button>
      </div>
    );
  }

  // Pantalla "ingresá tu email para recuperar contraseña"
  if (step === "forgot") {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xl font-semibold text-stone-900">Recuperar contraseña</p>
          <p className="text-sm text-stone-500">
            Te enviamos un link para crear una nueva.
          </p>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-800 outline-none focus:border-[#f27a3f] focus:bg-white placeholder:text-stone-400 transition"
        />
        {errorMsg && <p className="text-xs text-red-500 px-1">{errorMsg}</p>}
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={submitting || !email}
          className="w-full rounded-2xl bg-[#f27a3f] py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(242,122,63,0.3)] disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar link de recuperación"}
        </button>
        <button
          type="button"
          onClick={() => { setStep("form"); setErrorMsg(null); }}
          className="w-full text-sm text-stone-400 py-2"
        >
          Volver
        </button>
      </div>
    );
  }

  // Pantalla post-forgot
  if (step === "forgot-sent") {
    return (
      <div className="text-center space-y-5">
        <p className="text-xl font-semibold text-stone-900">Revisá tu casilla</p>
        <p className="text-sm text-stone-500 leading-6">
          Te enviamos un link a{" "}
          <span className="font-medium text-stone-700">{email}</span>.
          Hacé clic en él para crear una nueva contraseña.
        </p>
        <button
          type="button"
          onClick={() => { setStep("form"); setMode("login"); setErrorMsg(null); }}
          className="w-full rounded-2xl border border-stone-200 py-3.5 text-sm font-medium text-stone-500"
        >
          Volver al inicio de sesión
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
          onClick={() => { setMode("register"); setErrorMsg(null); setNeedsConfirmation(false); }}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            mode === "register" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
          }`}
        >
          Crear cuenta
        </button>
        <button
          type="button"
          onClick={() => { setMode("login"); setErrorMsg(null); setNeedsConfirmation(false); }}
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

        {mode === "login" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setStep("forgot"); setErrorMsg(null); }}
              className="text-xs text-stone-400 hover:text-[#f27a3f] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="space-y-2">
            <p className="text-xs text-red-500 px-1">{errorMsg}</p>
            {needsConfirmation && email && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown}
                className="text-xs font-medium text-[#f27a3f] underline underline-offset-2 disabled:opacity-40"
              >
                {resendCooldown ? "Email enviado" : "Reenviar email de confirmación"}
              </button>
            )}
            {resendMsg && (
              <p className="text-xs text-stone-500 px-1">{resendMsg}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-[#f27a3f] py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(242,122,63,0.3)] disabled:opacity-50 mt-2"
        >
          {submitting ? "Procesando..." : mode === "register" ? "Crear cuenta" : "Ingresar"}
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
