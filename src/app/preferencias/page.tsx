import PreferenciasClient from "./PreferenciasClient";

type SearchParams = Promise<{
  plan?: string;
  cuisine?: string;
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
    />
  );
}
