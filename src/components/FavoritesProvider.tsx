"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import { logRestaurantInteraction } from "@/lib/supabase/events";

type FavoritesContextValue = {
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const STORAGE_KEY = "restaurant-recommendation:favorites";

function getStoredFavorites() {
  if (typeof window === "undefined") return [];

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as string[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let active = true;

    async function syncFavorites() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !active) {
        return;
      }

      const localFavorites = getStoredFavorites();

      if (localFavorites.length > 0) {
        await supabase.from("favorite_restaurants").upsert(
          localFavorites.map((restaurantSlug) => ({
            user_id: user.id,
            restaurant_slug: restaurantSlug,
          })),
          { onConflict: "user_id,restaurant_slug" },
        );
      }

      const { data } = await supabase
        .from("favorite_restaurants")
        .select("restaurant_slug")
        .eq("user_id", user.id);

      if (!active || !data) {
        return;
      }

      const syncedFavorites = data.map((item) => item.restaurant_slug);
      setFavorites(syncedFavorites);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedFavorites));
    }

    void syncFavorites();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        return;
      }

      void syncFavorites();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isFavorite: (slug) => favorites.includes(slug),
      toggleFavorite: (slug) => {
        void (async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          const isRemoving = favorites.includes(slug);

          if (user) {
            if (isRemoving) {
              await supabase
                .from("favorite_restaurants")
                .delete()
                .eq("user_id", user.id)
                .eq("restaurant_slug", slug);
            } else {
              await supabase.from("favorite_restaurants").upsert({
                user_id: user.id,
                restaurant_slug: slug,
              });
            }
          }

          await logRestaurantInteraction({
            restaurantSlug: slug,
            action: isRemoving ? "favorite_removed" : "favorite_added",
          });
        })();

        setFavorites((current) =>
          current.includes(slug)
            ? current.filter((item) => item !== slug)
            : [...current, slug],
        );
      },
    }),
    [favorites, supabase],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }

  return context;
}
