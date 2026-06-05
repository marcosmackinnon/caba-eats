/**
 * Fotos de comida por tipo de cocina.
 * Usa picsum.photos con seeds específicos para imágenes consistentes.
 * Siempre carga (no depende de APIs externas ni API keys).
 */

// IDs de picsum que visualmente tienen tonos de comida/calidez
const CUISINE_SEEDS: Record<string, string> = {
  Parrilla:       "food-grill",
  Pizza:          "food-pizza",
  Sushi:          "food-sushi",
  Japonesa:       "food-japanese",
  Brunch:         "food-brunch",
  Café:           "food-coffee",
  Hamburguesas:   "food-burger",
  Italiana:       "food-pasta",
  Mexicana:       "food-tacos",
  China:          "food-chinese",
  India:          "food-indian",
  Coreana:        "food-korean",
  Vegetariana:    "food-salad",
  Vegana:         "food-vegan",
  Peruana:        "food-peruvian",
  Árabe:          "food-arabic",
  Española:       "food-spanish",
  Francesa:       "food-french",
  "Bar & tragos": "food-cocktails",
  Mariscos:       "food-seafood",
  Postres:        "food-dessert",
};

export function getRestaurantPhotoUrl(cuisine: string): string {
  const seed = CUISINE_SEEDS[cuisine] ?? "food-restaurant";
  return `https://picsum.photos/seed/${seed}/800/400`;
}
