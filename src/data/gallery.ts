/**
 * Galerías de 5 fotos por tipo de cocina.
 * Mix de: interior/ambiente del local + platos representativos.
 * IDs verificados desde Unsplash.
 */

const BASE = "https://images.unsplash.com/photo-";
const OPT  = "?w=700&h=500&fit=crop&q=80&auto=format";

// Fotos genéricas de interiores cálidos de restaurante (reutilizadas como filler)
const WARM_INTERIOR   = "1517248135467-4c7edcad34c4"; // steakhouse interior warm
const COZY_TABLE      = "1709548145082-04d0cde481d4"; // cozy restaurant table
const FINE_DINING     = "1727352037068-9091d4789738"; // elegant dining room
const CASUAL_DINING   = "1726873800099-53f5496281e0"; // casual restaurant
const STREET_OUTSIDE  = "1550927001-03fd6b9e9262"; // restaurant exterior street
const BAR_COUNTER     = "1566417713940-fe7c737a9ef2"; // bar counter lit
const OPEN_KITCHEN    = "1570560258879-af7f8e1447ac"; // open kitchen grill

// Food photos (de photos.ts, reutilizados para coherencia)
const FOOD: Record<string, string> = {
  Parrilla:       "1562625964-ffe9b2f617fc",
  Pizza:          "1582476927499-65372fb1a458",
  Sushi:          "1553621042-f6e147245754",
  Japonesa:       "1553621042-f6e147245754",
  Brunch:         "1525351484163-7529414344d8",
  Café:           "1553962311-62f2471b159d",
  Hamburguesas:   "1551730707-ae4fde676aae",
  Italiana:       "1574969903809-3f7a1668ceb0",
  Mexicana:       "1574782091246-c65ed4510300",
  China:          "1592778024292-d6782d22add7",
  India:          "1742599361539-f096753d1100",
  Coreana:        "1661366394743-fe30fe478ef7",
  Vegetariana:    "1561043433-aaf687c4cf04",
  Vegana:         "1512621776951-a57141f2eefd",
  Peruana:        "1611262359546-64e2822b2ab5",
  Árabe:          "1697126248475-a537cc5cce28",
  Española:       "1650964807311-970cb88d347c",
  Francesa:       "1623334044303-241021148842",
  "Bar & tragos": "1597075687490-8f673c6c17f6",
  Mariscos:       "1559737558-2f5a35f4523b",
  Postres:        "1571115177098-24ec42ed204d",
};

// Interiores específicos por categoría (ambiente del lugar)
const INTERIORS: Record<string, string[]> = {
  Parrilla: [
    WARM_INTERIOR,
    "1670819917685-f1040e76b9b7", // steakhouse dark wood
    OPEN_KITCHEN,
    "1682778418768-16081e4470a1", // grill restaurant
    COZY_TABLE,
  ],
  Pizza: [
    "1776704983009-ab315838d4c1", // italian trattoria
    CASUAL_DINING,
    WARM_INTERIOR,
    "1663585057404-ea5d871c7e4a", // pizza place interior
    STREET_OUTSIDE,
  ],
  Sushi: [
    "1696449241254-11cf7f18ce32", // japanese restaurant minimal
    "1725122194872-ace87e5a1a8d", // sushi bar counter
    "1634881091116-1876b8c2b414", // japanese interior zen
    "1707202282188-f8d03b2791b5", // modern japanese dining
    FINE_DINING,
  ],
  Japonesa: [
    "1696449241254-11cf7f18ce32",
    "1725122194872-ace87e5a1a8d",
    "1634881091116-1876b8c2b414",
    FINE_DINING,
    COZY_TABLE,
  ],
  Italiana: [
    "1776704983009-ab315838d4c1", // trattoria interior
    WARM_INTERIOR,
    COZY_TABLE,
    CASUAL_DINING,
    STREET_OUTSIDE,
  ],
  Café: [
    "1453614512568-c4024d13c247", // café interior bright
    "1511081692775-05d0f180a065", // cozy café window
    "1600093463592-8e36ae95ef56", // coffee shop tables
    "1521017432531-fbd92d768814", // café morning light
    STREET_OUTSIDE,
  ],
  Brunch: [
    "1453614512568-c4024d13c247",
    "1600093463592-8e36ae95ef56",
    "1554118811-1e0d58224f24", // bright airy café
    "1521017432531-fbd92d768814",
    CASUAL_DINING,
  ],
  "Bar & tragos": [
    BAR_COUNTER,
    "1569924995012-c4c706bfcd51", // bar with bottles lit
    "1615887026505-00283cf0ff83", // cocktail bar dark
    "1696062985889-de626efe0148", // stylish bar
    "1640902106532-47dd3a2e833e", // bar counter night
  ],
  Hamburguesas: [
    CASUAL_DINING,
    STREET_OUTSIDE,
    WARM_INTERIOR,
    COZY_TABLE,
    "1726873800099-53f5496281e0",
  ],
  Mexicana: [
    CASUAL_DINING,
    "1727352037068-9091d4789738",
    STREET_OUTSIDE,
    WARM_INTERIOR,
    COZY_TABLE,
  ],
  Peruana: [
    FINE_DINING,
    WARM_INTERIOR,
    COZY_TABLE,
    CASUAL_DINING,
    STREET_OUTSIDE,
  ],
  Española: [
    WARM_INTERIOR,
    BAR_COUNTER,
    CASUAL_DINING,
    COZY_TABLE,
    STREET_OUTSIDE,
  ],
  Francesa: [
    FINE_DINING,
    COZY_TABLE,
    WARM_INTERIOR,
    "1453614512568-c4024d13c247",
    STREET_OUTSIDE,
  ],
};

// Fallback para cocinas sin interior específico
const FALLBACK_INTERIORS = [
  WARM_INTERIOR,
  COZY_TABLE,
  FINE_DINING,
  CASUAL_DINING,
  STREET_OUTSIDE,
];

/**
 * Devuelve 5 URLs de fotos para la galería del restaurante.
 * Mezcla: 2 interiores del tipo de local + 1 foto de comida + 2 más de ambiente.
 */
export function getRestaurantGallery(cuisine: string): string[] {
  const interiors = INTERIORS[cuisine] ?? FALLBACK_INTERIORS;
  const foodPhoto = FOOD[cuisine] ?? "1414235077428-338989a624bc";

  // Slot 0: foto de comida (el plato representativo)
  // Slots 1-4: interiores del tipo de restaurante
  return [
    `${BASE}${foodPhoto}${OPT}`,
    `${BASE}${interiors[0]}${OPT}`,
    `${BASE}${interiors[1]}${OPT}`,
    `${BASE}${interiors[2]}${OPT}`,
    `${BASE}${interiors[3]}${OPT}`,
  ];
}
