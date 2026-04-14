"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthState = {
  email: string | null;
  loading: boolean;
};

export default function AuthStatus({
  compact = false,
}: {
  compact?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<AuthState>({
    email: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      setState({
        email: user?.email ?? null,
        loading: false,
      });
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        email: session?.user?.email ?? null,
        loading: false,
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (state.loading) {
    return (
      <span
        className={`rounded-full ${
          compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
        } text-stone-400`}
      >
        Cargando...
      </span>
    );
  }

  if (!state.email) {
    return (
      <Link
        href="/auth"
        className={`rounded-full border border-[#e8d6c8] bg-white ${
          compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
        } font-medium text-stone-700 transition hover:bg-[#fff5ee]`}
      >
        Ingresar
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`rounded-full border border-[#f4cfb7] bg-[#fff7f1] ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
      } font-medium text-[#c96124] transition hover:bg-[#fff1e7]`}
    >
      {compact ? "Salir" : `Salir · ${state.email.split("@")[0]}`}
    </button>
  );
}
