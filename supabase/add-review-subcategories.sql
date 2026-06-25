-- Agrega subcategorías opcionales a reviews
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS comida_rating   SMALLINT CHECK (comida_rating   BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS servicio_rating SMALLINT CHECK (servicio_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS ambiente_rating SMALLINT CHECK (ambiente_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS noise_level     TEXT,
  ADD COLUMN IF NOT EXISTS group_type      TEXT;
