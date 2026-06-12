-- Tabla de reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_slug text not null,
  rating numeric(2,1) not null check (rating >= 0.5 and rating <= 5.0),
  body text,
  photo_url text not null,
  created_at timestamptz not null default now(),
  unique (user_id, restaurant_slug)
);

alter table public.reviews enable row level security;

-- Cualquiera puede leer reviews
create policy "reviews_select_all"
on public.reviews for select
using (true);

-- Solo el dueño puede insertar la suya
create policy "reviews_insert_own"
on public.reviews for insert
to authenticated
with check ((select auth.uid()) = user_id);

-- Solo el dueño puede borrarla
create policy "reviews_delete_own"
on public.reviews for delete
to authenticated
using ((select auth.uid()) = user_id);

-- ─── Storage ────────────────────────────────────────────────────────────────
-- Crear el bucket si no existe
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

-- Cualquiera puede ver las fotos (bucket público)
create policy "review_photos_select"
on storage.objects for select
using (bucket_id = 'review-photos');

-- Usuarios autenticados pueden subir fotos al bucket
create policy "review_photos_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'review-photos');

-- Solo el dueño (path empieza con su user_id) puede borrar su foto
create policy "review_photos_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'review-photos'
  and position((select auth.uid()::text) in name) = 1
);
