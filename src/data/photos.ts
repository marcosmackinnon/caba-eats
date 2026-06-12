/**
 * Fotos de Unsplash por restaurante (slug) con fallback por tipo de cocina.
 * Si la foto no carga, el componente muestra el gradiente original.
 */

const BASE = "https://images.unsplash.com/photo-";
const OPT  = "?w=800&h=400&fit=crop&q=80&auto=format";

// Foto única por restaurante — ninguna card se repite
const RESTAURANT_PHOTOS: Record<string, string> = {
  // ── Parrilla ──────────────────────────────────────────────────────────────
  "grasa":               "1562625964-ffe9b2f617fc", // asado con brasas
  "don-julio":           "1555939594-58d7cb561733", // bife de chorizo en plato
  "la-brigada":          "1546069901-ba9599a7e63c", // carne a la parrilla
  "chori":               "1558030006-9e198486a2fb", // chorizo a la parrilla
  "la-americana":        "1544025162-d76538645564", // BBQ con carbón
  "happening":           "1529193591184-b1d58069ecdd", // steak fine dining

  // ── Pizza ─────────────────────────────────────────────────────────────────
  "atte-pizzeria-napoletana": "1582476927499-65372fb1a458", // napoletana con fior di latte
  "guerrin":             "1565299624946-b28f40a0ae38", // pizza a la porción
  "el-cuartito":         "1513104890138-7c749659a591", // pizza entera clásica
  "lapislazuli":         "1571407970349-bc81e7e96d47", // pizza artesanal horno

  // ── Sushi ─────────────────────────────────────────────────────────────────
  "osaka-concepcion":    "1553621042-f6e147245754", // sushi variado
  "kona":                "1617196034183-421b4040ed20", // rolls coloridos

  // ── Japonesa ──────────────────────────────────────────────────────────────
  "nueva-casa-japonesa": "1559410545-0bdcd187e0a6", // ramen y gyoza
  "udon":                "1611143669185-af224c5e3252", // udon bowl

  // ── Italiana ──────────────────────────────────────────────────────────────
  "sottovoce":           "1574969903809-3f7a1668ceb0", // pasta al ragú
  "piegari":             "1551183053-bf91798d386c",    // tagliatelle trufadas

  // ── Café ──────────────────────────────────────────────────────────────────
  "ninina":              "1553962311-62f2471b159d", // café con latte art
  "el-federal":          "1495474472287-4d71bcdd2085", // espresso y medialunas

  // ── Hamburguesas ──────────────────────────────────────────────────────────
  "burger-joint":        "1551730707-ae4fde676aae", // hamburguesa en mano
  "proper":              "1568901346375-23c9450c58cd", // smash burger premium

  // ── Peruana ───────────────────────────────────────────────────────────────
  "la-mar":              "1611262359546-64e2822b2ab5", // ceviche clásico
  "el-preferido":        "1535473895227-bdecb20fb157", // tiradito y leche de tigre
  "osaka-belgrano":      "1559847844-5315695dadae",   // nikkei / sushi peruano

  // ── Bar & tragos ──────────────────────────────────────────────────────────
  "presidente-bar":      "1597075687490-8f673c6c17f6", // cocktails sobre barra
  "bar-el-toro":         "1551024709-8f23befc2f87",    // negroni y copas
  "te-matare-ramirez":   "1572116469-8499d15a4e5e",    // bar con ambiente íntimo

  // ── Brunch ────────────────────────────────────────────────────────────────
  "barragan":            "1525351484163-7529414344d8", // plato de brunch completo
  "nucha":               "1504754524776-8f4f37304e92", // tostadas con huevo y palta
  "la-alacena-belgrano": "1567620905732-2d1ec7ab7445", // pancakes y zumos

  // ── Española ──────────────────────────────────────────────────────────────
  "bilbao":              "1650964807311-970cb88d347c", // paella valenciana
  "sagardi":             "1534080564583-6be75777b70a", // pintxos vascos

  // ── Francesa ──────────────────────────────────────────────────────────────
  "lo-del-frances":      "1623334044303-241021148842", // bistró francés / croque
  "roux":                "1549197866-56c4c3b9b1bf",    // plato de autor francés

  // ── India ─────────────────────────────────────────────────────────────────
  "gran-dabbang":        "1742599361539-f096753d1100", // curry de pollo con arroz
  "chanchal":            "1585937421612-70a008356fbe", // thali indio

  // ── Coreana ───────────────────────────────────────────────────────────────
  "mr-ho":               "1661366394743-fe30fe478ef7", // Korean BBQ en la mesa
  "mui":                 "1628557010474-486b89e48e96", // bibimbap y banchan

  // ── Mexicana ──────────────────────────────────────────────────────────────
  "la-fabrica-del-taco": "1574782091246-c65ed4510300", // tacos con guacamole
  "taco-box":            "1565299585323-38d6b0865b47", // street tacos

  // ── Vegana ────────────────────────────────────────────────────────────────
  "sacro":               "1512621776951-a57141f2eefd", // buddha bowl colorido
  "green-bamboo":        "1540420773420-3366772f4999", // bowl plant-based verde

  // ── Únicos ────────────────────────────────────────────────────────────────
  "buenos-aires-verde":  "1561043433-aaf687c4cf04", // ensalada fresca
  "sarkis":              "1697126248475-a537cc5cce28", // hummus y mezze árabe
  "la-pescadorita":      "1559737558-2f5a35f4523b",   // mariscos frescos
  "chungo":              "1571115177098-24ec42ed204d", // torta de postre
};

// Fallback por cocina si el slug no tiene foto propia
const CUISINE_PHOTOS: Record<string, string> = {
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

export function getRestaurantPhotoUrl(cuisine: string, slug?: string): string {
  if (slug) {
    const id = RESTAURANT_PHOTOS[slug];
    if (id) return `${BASE}${id}${OPT}`;
  }
  const id = CUISINE_PHOTOS[cuisine];
  if (id) return `${BASE}${id}${OPT}`;
  return `${BASE}1414235077428-338989a624bc${OPT}`;
}
