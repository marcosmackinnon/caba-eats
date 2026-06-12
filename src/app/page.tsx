import { redirect } from "next/navigation";
import Link from "next/link";
import AppNavigation from "@/components/AppNavigation";
import HomeSearch from "@/components/HomeSearch";
import { getRestaurantPhotoUrl } from "@/data/photos";
import { restaurants } from "@/data/restaurants";
import { trendingSpot } from "@/data/trending";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // En Next.js 15+, searchParams es una Promise y hay que awaitarla
  const params = await searchParams;

  // Supabase redirige acá con ?code= cuando el redirectTo no funciona correctamente.
  // Lo mandamos a /auth/reset-password para que procese el código.
  const code = params?.code;
  if (code && typeof code === "string") {
    redirect(`/auth/reset-password?code=${code}`);
  }

  // Supabase redirige acá cuando el link expiró o hubo error de auth.
  const errorCode = params?.error_code;
  if (errorCode === "otp_expired") {
    redirect("/auth?error=link_expired");
  }
  if (params?.error === "access_denied") {
    redirect("/auth?error=access_denied");
  }
  const trendingRestaurant =
    restaurants.find(
      (restaurant) => restaurant.slug === trendingSpot.restaurantSlug,
    ) ?? restaurants[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff6ed,_#fffdf8_55%,_#fff4e7)] pb-28 text-stone-900 md:pb-0">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-4 py-4 sm:px-10 sm:py-6 lg:px-12">
        <header className="flex items-center justify-between rounded-[28px] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_12px_50px_rgba(201,97,36,0.08)] backdrop-blur md:rounded-full">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
              Buenos Aires, AR
            </p>
            <p className="text-sm font-medium text-stone-600">CABA</p>
          </div>
          <AppNavigation />
        </header>

        <section className="grid gap-8 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14 lg:py-16">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-stone-900 sm:text-5xl lg:text-6xl">
                Encontrá dónde comer en instantes.
              </h1>
              <p className="max-w-md text-base leading-7 text-stone-500 sm:text-lg">
                Elegís el plan, la comida y tu ubicación o zona, y te devolvemos las mejores 3 opciones.
              </p>
            </div>

            <HomeSearch />

            <div className="space-y-3">
              <Link
                href="/plan"
                className="flex items-center justify-center gap-2 rounded-full bg-[#f27a3f] px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_40px_rgba(242,122,63,0.35)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
              >
                Buscar restaurante
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/favoritos"
                className="flex items-center justify-center gap-2 rounded-full border border-[#e8d6c8] bg-white px-6 py-4 text-center text-base font-semibold text-stone-700 transition-colors hover:bg-[#fffaf6] sm:inline-flex sm:ml-3"
              >
                Ver favoritos
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f27a3f]" />
                4 pasos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f27a3f]" />
                Sin registro
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f27a3f]" />
                Solo CABA
              </span>
            </div>
          </div>

          <aside className="space-y-4 sm:space-y-5">
            <div className="rounded-[26px] border border-[#f0dccd] bg-white/92 p-4 text-stone-900 shadow-[0_16px_45px_rgba(201,97,36,0.08)] sm:rounded-[30px] sm:p-5">
              <div
                className="relative overflow-hidden rounded-[22px] bg-cover bg-center"
                style={{ backgroundImage: `url(${getRestaurantPhotoUrl(trendingRestaurant.cuisine, trendingRestaurant.slug)})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
                <div className="relative p-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
                      {trendingSpot.label}
                    </p>
                    <span className="shrink-0 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      #1 del momento
                    </span>
                  </div>
                  <div className="mt-16 pb-1">
                    <Link
                      href={`/restaurant/${trendingRestaurant.slug}`}
                      className="group inline-block"
                    >
                      <h2 className="text-2xl font-semibold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.6)] underline decoration-transparent underline-offset-2 transition group-hover:decoration-white/70">
                        {trendingRestaurant.name}
                      </h2>
                    </Link>
                    <p className="mt-1 text-sm text-white/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
                      {trendingSpot.zone} · viral en {trendingSpot.source}
                    </p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-white/75 [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">
                      {trendingSpot.headline}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#fff7f1] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                    Categoría
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {trendingSpot.label}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fff7f1] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                    Zona
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {trendingSpot.zone}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fff7f1] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                    Fuente
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {trendingSpot.source}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-stone-600">
                {trendingSpot.description} {trendingSpot.updatedAt}.
              </p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
