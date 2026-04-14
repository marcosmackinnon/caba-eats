"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export default function AuthForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setSubmitting(false);
        return;
      }

      setMessage("Cuenta creada. Ya podés empezar a guardar favoritos con tu usuario.");
      setSubmitting(false);
      router.push("/");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="rounded-[30px] border border-[#f0dccd] bg-white/92 p-5 shadow-[0_24px_60px_rgba(201,97,36,0.1)] sm:p-8">
      <div className="flex gap-2 rounded-full bg-[#fff7f1] p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            mode === "login"
              ? "bg-[#f27a3f] text-white shadow-[0_12px_25px_rgba(242,122,63,0.22)]"
              : "text-stone-500"
          }`}
        >
          Ingresar
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            mode === "register"
              ? "bg-[#f27a3f] text-white shadow-[0_12px_25px_rgba(242,122,63,0.22)]"
              : "text-stone-500"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Nombre</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-2xl border border-[#ead7c9] bg-[#fffaf6] px-4 py-3 text-sm text-stone-700 outline-none focus:border-[#f27a3f]"
              placeholder="Cómo te llamás"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="w-full rounded-2xl border border-[#ead7c9] bg-[#fffaf6] px-4 py-3 text-sm text-stone-700 outline-none focus:border-[#f27a3f]"
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {message ? (
          <div className="rounded-2xl border border-[#f4cfb7] bg-[#fff7f1] px-4 py-3 text-sm text-stone-600">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[#f27a3f] px-5 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(242,122,63,0.25)] disabled:opacity-60"
        >
          {submitting
            ? "Procesando..."
            : mode === "login"
            ? "Entrar"
            : "Crear cuenta"}
        </button>
      </form>

      <div className="mt-6 rounded-[24px] bg-[#fff8f2] p-4 text-sm leading-6 text-stone-600">
        Al crear una cuenta vas a poder guardar favoritos, mantener tu historial
        y mejorar la personalización con el uso.
      </div>

      <Link
        href="/"
        className="mt-5 inline-flex text-sm font-medium text-stone-500 underline underline-offset-4"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
