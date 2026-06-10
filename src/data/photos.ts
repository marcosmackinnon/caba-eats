/**
 * Fotos reales de Unsplash por tipo de cocina.
 * IDs verificados directamente desde las páginas de Unsplash.
 * Si la foto no carga, el componente muestra el gradiente original.
 */

const BASE = "https://images.unsplash.com/photo-";
const OPT  = "?w=800&h=400&fit=crop&q=80&auto=format";

// IDs verificados: cada uno corresponde exactamente a una foto de comida
const CUISINE_PHOTOS: Record<string, string> = {
  // 🥩 Carne a la parrilla argentina
  Parrilla:       "1562625964-ffe9b2f617fc",
  // 🍕 Pizza margarita
  Pizza:          "1582476927499-65372fb1a458",
  // 🍣 Variedad de sushi
  Sushi:          "1553621042-f6e147245754",
  // 🍱 Sushi japonés (más elaborado)
  Japonesa:       "1553621042-f6e147245754",
  // 🥞 Brunch con huevos y palta
  Brunch:         "1525351484163-7529414344d8",
  // ☕ Café con arte latte
  Café:           "1553962311-62f2471b159d",
  // 🍔 Hamburguesa en mano
  Hamburguesas:   "1551730707-ae4fde676aae",
  // 🍝 Pasta con ragú
  Italiana:       "1574969903809-3f7a1668ceb0",
  // 🌮 Tacos frescos
  Mexicana:       "1574782091246-c65ed4510300",
  // 🥡 Dim sum / noodles
  China:          "1592778024292-d6782d22add7",
  // 🍛 Curry de pollo indio con arroz
  India:          "1742599361539-f096753d1100",
  // 🥢 Korean BBQ
  Coreana:        "1661366394743-fe30fe478ef7",
  // 🥗 Bowl de ensalada colorido
  Vegetariana:    "1561043433-aaf687c4cf04",
  // 🌿 Bowl plant-based
  Vegana:         "1512621776951-a57141f2eefd",
  // 🐟 Ceviche peruano
  Peruana:        "1611262359546-64e2822b2ab5",
  // 🧆 Hummus y mezze árabe
  Árabe:          "1697126248475-a537cc5cce28",
  // 🥘 Paella española
  Española:       "1650964807311-970cb88d347c",
  // 🥐 Bistró francés / croissant
  Francesa:       "1623334044303-241021148842",
  // 🍸 Cocktails de bar
  "Bar & tragos": "1597075687490-8f673c6c17f6",
  // 🦐 Mariscos / langostinos
  Mariscos:       "1559737558-2f5a35f4523b",
  // 🍰 Torta / postre elegante
  Postres:        "1571115177098-24ec42ed204d",
};

export function getRestaurantPhotoUrl(cuisine: string): string {
  const id = CUISINE_PHOTOS[cuisine];
  if (!id) return `${BASE}1414235077428-338989a624bc${OPT}`;
  return `${BASE}${id}${OPT}`;
}
