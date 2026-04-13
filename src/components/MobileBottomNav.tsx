"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useFavorites } from "./FavoritesProvider";

const items = [
  { href: "/", label: "Inicio", icon: "⌂" },
  { href: "/plan", label: "Buscar", icon: "⌕" },
  { href: "/favoritos", label: "Favoritos", icon: "♡" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { favorites } = useFavorites();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-around rounded-[28px] border border-white/80 bg-white/92 px-2 py-2 shadow-[0_18px_45px_rgba(201,97,36,0.16)] backdrop-blur md:hidden">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex min-w-20 flex-col items-center justify-center rounded-[20px] px-3 py-2 text-xs font-medium transition ${
              isActive ? "bg-[#fff1e7] text-[#c96124]" : "text-stone-500"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="mt-1">{item.label}</span>
            {item.href === "/favoritos" ? (
              <span className="absolute right-2 top-1 rounded-full bg-[#f27a3f] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {favorites.length}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
