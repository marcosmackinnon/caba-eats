-- Agrega price_range a reviews
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS price_range TEXT;
