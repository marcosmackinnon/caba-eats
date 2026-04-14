import PreferenciasClient from "./PreferenciasClient";

type SearchParams = Promise<{
  plan?: string;
  cuisine?: string;
  vibe?: string;
  budget?: string;
  distance?: string;
  zone?: string;
  userLat?: string;
  userLng?: string;
  userLabel?: string;
}>;

export default async function PreferenciasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedPlan = params.plan ?? "Con amigos";
  const selectedCuisine = params.cuisine ?? "Sin preferencia";

  return (
    <PreferenciasClient
      selectedPlan={selectedPlan}
      selectedCuisine={selectedCuisine}
      initialBudget={Number(params.budget ?? "28000")}
      initialDistance={Number(params.distance ?? "5")}
      initialVibes={(params.vibe ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)}
      initialLocation={
        params.userLat && params.userLng
          ? {
              type: "gps" as const,
              lat: Number(params.userLat),
              lng: Number(params.userLng),
              label: params.userLabel ?? "Tu ubicación actual",
            }
          : params.zone
          ? {
              type: "manual" as const,
              zone: params.zone,
            }
          : { type: "idle" as const }
      }
    />
  );
}
