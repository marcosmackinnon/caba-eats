"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import AuthStatus from "./AuthStatus";
import { useFavorites } from "./FavoritesProvider";

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.75z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function IconSearch({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  );
}

function IconHeart({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconClock({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14.5" />
    </svg>
  );
}

const items = [
  { href: "/", label: "Inicio", Icon: IconHome },
  { href: "/plan", label: "Buscar", Icon: IconSearch },
  { href: "/favoritos", label: "Favoritos", Icon: IconHeart },
  { href: "/historial", label: "Historial", Icon: IconClock },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { favorites } = useFavorites();

  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-[26px] border border-white/80 bg-white/95 px-1 py-1.5 shadow-[0_18px_45px_rgba(201,97,36,0.16)] backdrop-blur md:hidden">
      {items.map(({ href, label, Icon }) => {
        const isActive =
          href === "/"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-col items-center justify-center gap-0.5 rounded-[18px] px-3 py-2 text-[10px] font-medium transition ${
              isActive ? "bg-[#fff1e7] text-[#c96124]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Icon active={isActive} />
            <span>{label}</span>
            {href === "/favoritos" && favorites.length > 0 ? (
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
