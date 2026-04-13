"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useFavorites } from "./FavoritesProvider";

const items = [
  { href: "/", label: "Inicio" },
  { href: "/plan", label: "Buscar" },
  { href: "/favoritos", label: "Favoritos" },
];

export default function AppNavigation() {
  const pathname = usePathname();
  const { favorites } = useFavorites();

  return (
    <nav className="hidden flex-wrap items-center gap-2 rounded-full border border-white/80 bg-white/85 p-1.5 shadow-[0_12px_35px_rgba(201,97,36,0.08)] backdrop-blur md:flex">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-[#f27a3f] text-white shadow-[0_12px_25px_rgba(242,122,63,0.22)]"
                : "text-stone-600 hover:bg-[#fff5ee]"
            }`}
          >
            <span>{item.label}</span>
            {item.href === "/favoritos" ? (
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-[#fff1e7] text-[#c96124]"
                }`}
              >
                {favorites.length}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
