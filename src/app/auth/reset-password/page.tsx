"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "ready" | "error" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // El link de Supabase llega con ?code=xxx en la URL
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            setStatus("error");
          } else {
            setStatus("ready");
          }
        });
    } else {
      // Sin code: puede que la sesión ya esté activa (PASSWORD_RECOVERY via hash)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setStatus("ready");
        } else {
          setStatus("error");
        }
      });
    }
  }, [supabase]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Mínimo 6 caracteres.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setErrorMsg("No se pudo actualizar la contraseña. Intentá de nuevo.");
    } else {
      setStatus("success");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#fffaf4]">
      {/* Bloque naranja */}
      <div className="relative flex flex-col items-center justify-center bg-[#f27a3f] px-6 pt-24 pb-24">
        <div className="absolute bottom-0 left-1/2 h-28 w-[150%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-[#fffaf4]" />
        <span
          className="relative text-6xl font-bold tracking-[-0.04em] text-white"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
        >
          Dondy
        </span>
        <p className="relative mt-3 text-base font-medium text-white/80">
          Nueva contraseña
        </p>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col justify-center px-6 pt-16 pb-10">
        {status === "loading" && (
          <p className="text-center text-sm text-stone-400">Verificando enlace...</p>
        )}

        {status === "error" && (
          <div className="text-center space-y-5">
            <p className="text-xl font-semibold text-stone-900">Link inválido o expirado</p>
            <p className="text-sm text-stone-500 leading-6">
              Este link ya fue usado o expiró. Pedí uno nuevo desde la pantalla de inicio de sesión.
            </p>
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="w-full rounded-2xl bg-[#f27a3f] py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(242,122,63,0.3)]"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-3">
            <p className="text-xl font-semibold text-stone-900">Contraseña actualizada</p>
            <p className="text-sm text-stone-500">Entrando a la app...</p>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <p className="text-xl font-semibold text-stone-900">Crear nueva contraseña</p>
              <p className="text-sm text-stone-500">Elegí una contraseña segura para tu cuenta.</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Nueva contraseña"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-800 outline-none focus:border-[#f27a3f] focus:bg-white placeholder:text-stone-400 transition"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              placeholder="Repetir contraseña"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-800 outline-none focus:border-[#f27a3f] focus:bg-white placeholder:text-stone-400 transition"
            />
            {errorMsg && (
              <p className="text-xs text-red-500 px-1">{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#f27a3f] py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(242,122,63,0.3)] disabled:opacity-50 mt-2"
            >
              {submitting ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
