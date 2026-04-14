"use client";

import { useEffect, useRef } from "react";

import { logSearchEvent } from "@/lib/supabase/events";

const LAST_SEARCH_PARAMS_KEY = "restaurant-recommendation:last-search-params";

export function getLastSearchParamsKey() {
  return LAST_SEARCH_PARAMS_KEY;
}

export default function SearchSessionSync({
  params,
  payload,
}: {
  params: string;
  payload?: {
    plan: string;
    cuisine: string;
    zone?: string;
    budget: number;
    distance: number;
    vibes: string[];
    userLabel?: string;
    userLat?: number;
    userLng?: number;
    selectedResults: string[];
  };
}) {
  const loggedRef = useRef(false);

  useEffect(() => {
    window.localStorage.setItem(LAST_SEARCH_PARAMS_KEY, params);
  }, [params]);

  useEffect(() => {
    if (!payload || loggedRef.current) {
      return;
    }

    loggedRef.current = true;
    void logSearchEvent(payload);
  }, [payload]);

  return null;
}
