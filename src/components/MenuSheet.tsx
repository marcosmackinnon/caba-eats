"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  name: string;
  price: number;
};

export default function MenuSheet({
  restaurantName,
  cuisine,
  zone,
  items,
}: {
  restaurantName: string;
  cuisine: string;
  zone: string;
  items: MenuItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center rounded-full bg-[#f27a3f] px-5 py-3 text-base font-semibold text-white shadow-[0_16px_35px_rgba(242,122,63,0.25)] transition hover:bg-[#eb6e31]"
      >
        Abrir menú
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-[32px] bg-[#fffaf4] shadow-[0_30px_80px_rgba(0,0,0,0.22)] sm:max-w-4xl sm:rounded-[32px]">
            <div className="border-b border-[#f0dccd] bg-white/92 px-4 py-4 sm:px-6">
              <div className="mb-3 flex justify-center sm:hidden">
                <span className="h-1.5 w-14 rounded-full bg-[#e4cdbb]" />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
                    Menú actual
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-900 sm:text-3xl">
                    {restaurantName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600 sm:text-base">
                    {cuisine} · {zone} · precios cargados en la app
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead7c9] bg-white text-lg text-stone-600"
                  aria-label="Cerrar menú"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="max-h-[calc(92vh-110px)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="rounded-[24px] border border-[#f0dccd] bg-white p-4 shadow-[0_16px_40px_rgba(201,97,36,0.08)] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm leading-6 text-stone-600">
                    Lista de platos y precios estimados para esta versión del producto.
                  </p>
                  <span className="rounded-full bg-[#fff1e7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#c96124]">
                    Actualizado hoy
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item.name}
                    className="rounded-[24px] border border-[#f0dccd] bg-white p-4 shadow-[0_16px_40px_rgba(201,97,36,0.08)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                      Plato
                    </p>
                    <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-stone-900">
                      {item.name}
                    </h3>
                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#fff8f2] px-4 py-3">
                      <span className="text-sm text-stone-500">Precio actual</span>
                      <span className="text-base font-semibold text-stone-900">
                        ${item.price.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
