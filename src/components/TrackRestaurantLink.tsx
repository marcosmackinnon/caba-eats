"use client";

import Link from "next/link";

import { logRestaurantInteraction } from "@/lib/supabase/events";

export default function TrackRestaurantLink({
  href,
  restaurantSlug,
  className,
  children,
}: {
  href: string;
  restaurantSlug: string;
  className?: string;
  children: React.ReactNode;
}) {
  function handleClick() {
    void logRestaurantInteraction({
      restaurantSlug,
      action: "open_from_results",
    });
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
