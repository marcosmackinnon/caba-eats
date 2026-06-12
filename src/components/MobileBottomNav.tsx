"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import AuthStatus from "./AuthStatus";
import { useFavorites } from "./FavoritesProvider";

const items = [
  { href: "/", label: "Inicio", icon: "⌂" },
  { href: "/plan", label: "Buscar", icon: "⌕" },
  { href: "/favoritos", label: "Favoritos", icon: "♡" },
  { href: "/historial", label: "Historial", icon: "🕐" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { favorites } = useFavorites();

  // No mostrar en la pantalla de auth
  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-[26px] border border-white/80 bg-white/95 px-1 py-1.5 shadow-[0_18px_45px_rgba(201,97,36,0.16)] backdrop-blur md:hidden">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center gap-0.5 rounded-[18px] px-2.5 py-2 text-[10px] font-medium transition ${
              isActive ? "bg-[#fff1e7] text-[#c96124]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
            {item.href === "/favoritos" && favorites.length > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#f27a3f] text-[9px] font-bold text-white">
                {favorites.length}
              </span>
            ) : null}
          </Link>
        );
      })}
      <AuthStatus compact />
    </nav>
  );
}
