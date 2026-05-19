import type {
  AvailabilityFilter,
  DealsFilter,
  PriceRange,
  ShopCategory,
  ShopSearchParams,
} from "./types";
import {
  getSelectedAvailability,
  getSelectedCategory,
  getSelectedDeals,
  getSelectedPriceRange,
} from "./filters";

export function buildShopHref(
  params: ShopSearchParams,
  updates: Partial<{
    sort: string;
    category: ShopCategory;
    price: PriceRange;
    availability: AvailabilityFilter;
    deals: DealsFilter;
    view: string;
    search: string;
  }>,
) {
  const nextParams = new URLSearchParams();

  const view = updates.view ?? params.view?.trim().toLowerCase() ?? "landing";
  if (view && view !== "landing") nextParams.set("view", view);

  const search = updates.search ?? params.search ?? "";
  if (search.trim()) nextParams.set("search", search.trim());

  const sort = updates.sort ?? params.sort?.trim().toLowerCase() ?? "featured";
  const category = updates.category ?? getSelectedCategory(params.category);
  const price = updates.price ?? getSelectedPriceRange(params.price);
  const availability =
    updates.availability ?? getSelectedAvailability(params.availability);
  const deals = updates.deals ?? getSelectedDeals(params.deals);

  if (sort !== "featured") nextParams.set("sort", sort);
  if (category !== "all") nextParams.set("category", category);
  if (price !== "all") nextParams.set("price", price);
  if (availability !== "all") nextParams.set("availability", availability);
  if (deals !== "all") nextParams.set("deals", deals);

  const queryString = nextParams.toString();
  return queryString ? `/shop?${queryString}` : "/shop";
}

export type ShopHeroCard = {
  key: string;
  title: string;
  description: string;
  href: string;
  image: string;
  cta: string;
  priority: boolean;
};

export type ShopNavLink = {
  key: string;
  label: string;
  href: string;
};

type CardDef = {
  key: string;
  title: string;
  description: string;
  cta: string;
  priority?: boolean;

  category: ShopCategory;
  view: "landing" | "products";
  search?: string;

  imageKeyword?: string;
  fallbackCategory?: ShopCategory;
  imageOverride?: string;
};

const DEFAULT_CARD_IMAGE = "/textures/wood_grain_5.jpg";

function pickCardImage(
  products: Array<{ name: string; image: string; category: ShopCategory }>,
  def: CardDef,
) {
  if (def.imageOverride) return def.imageOverride;

  const search = (def.search ?? "").trim().toLowerCase();
  const keyword = (def.imageKeyword ?? "").trim().toLowerCase();

  const matches = (name: string, needle: string) =>
    name.toLowerCase().includes(needle);

  const findMatch = (
    candidates: Array<{ name: string; image: string; category: ShopCategory }>,
  ) => {
    if (search && keyword) {
      const hit = candidates.find(
        (p) => matches(p.name, keyword) && matches(p.name, search),
      )?.image;
      if (hit) return hit;
    }

    if (search) {
      const hit = candidates.find((p) => matches(p.name, search))?.image;
      if (hit) return hit;
    }

    if (keyword) {
      const hit = candidates.find((p) => matches(p.name, keyword))?.image;
      if (hit) return hit;
    }

    return undefined;
  };

  const categoryCandidates = products.filter((p) => p.category === def.category);

  const categoryHit = findMatch(categoryCandidates);
  if (categoryHit) return categoryHit;

  if (categoryCandidates[0]?.image) return categoryCandidates[0].image;

  if (def.fallbackCategory) {
    const fallbackCandidates = products.filter(
      (p) => p.category === def.fallbackCategory,
    );

    const fallbackHit = findMatch(fallbackCandidates);
    if (fallbackHit) return fallbackHit;

    if (fallbackCandidates[0]?.image) return fallbackCandidates[0].image;
  }

  const globalHit = findMatch(products);
  if (globalHit) return globalHit;

  return DEFAULT_CARD_IMAGE;
}

function cardHref(params: ShopSearchParams, def: CardDef) {
  return buildShopHref(
    { ...params },
    {
      view: def.view,
      search: def.search ?? "",
      sort: "featured",
      category: def.category,
      price: "all",
      availability: "all",
      deals: "all",
    },
  );
}

const TOP_LEVEL_CATEGORY_CARDS: CardDef[] = [
  {
    key: "bowls",
    title: "Bowls",
    description: "Find the perfect bowl for everyday use.",
    cta: "Browse Bowls",
    priority: true,
    category: "bowls",
    view: "products",
    imageKeyword: "bowl",
    fallbackCategory: "bowls",
  },
  {
    key: "candles-holders",
    title: "Candles & Holders",
    description: "Warm accents for cozy spaces.",
    cta: "Browse Candles & Holders",
    category: "candles-holders",
    view: "products",
    imageKeyword: "candle",
    fallbackCategory: "candles-holders",
  },
  {
    key: "hand-crafts",
    title: "Hand Crafts",
    description: "Small tools and handmade favorites.",
    cta: "Browse Hand Crafts",
    category: "hand-crafts",
    view: "landing",
    imageKeyword: "seam ripper",
    fallbackCategory: "hand-crafts",
  },
  {
    key: "kitchen-utensils",
    title: "Kitchen Utensils",
    description: "Tools for cooking and serving.",
    cta: "Browse Kitchen Utensils",
    category: "kitchen-utensils",
    view: "products",
    imageKeyword: "spoon",
    fallbackCategory: "kitchen-utensils",
  },
  {
    key: "ornaments",
    title: "Ornaments",
    description: "Seasonal pieces and keepsakes.",
    cta: "Browse Ornaments",
    category: "ornaments",
    view: "products",
    imageKeyword: "ornament",
    fallbackCategory: "ornaments",
  },
  {
    key: "platters-trays",
    title: "Platters & Trays",
    description: "Hosting pieces for serving and gifting.",
    cta: "Browse Platters & Trays",
    category: "platters-trays",
    view: "landing",
    imageKeyword: "platter",
    fallbackCategory: "platters-trays",
  },
  {
    key: "rolling-pins",
    title: "Rolling Pins",
    description: "Rolling pins made to last.",
    cta: "Browse Rolling Pins",
    category: "rolling-pins",
    view: "landing",
    imageKeyword: "rolling pin",
    fallbackCategory: "rolling-pins",
  },
  {
    key: "salt-pepper-shakers",
    title: "Salt & Pepper Shakers",
    description: "Tabletop essentials with character.",
    cta: "Browse Shakers",
    category: "salt-pepper-shakers",
    view: "landing",
    imageKeyword: "shaker",
    fallbackCategory: "salt-pepper-shakers",
  },
  {
    key: "vases-vessels",
    title: "Vases & Vessels",
    description: "Decor pieces with natural warmth.",
    cta: "Browse Vases & Vessels",
    category: "vases-vessels",
    view: "landing",
    imageKeyword: "vase",
    fallbackCategory: "vases-vessels",
  },
  {
    key: "pens",
    title: "Pens",
    description: "Hand-turned pens for everyday writing.",
    cta: "Browse Pens",
    category: "pens",
    view: "products",
    imageKeyword: "pen",
    fallbackCategory: "pens",
  },
  {
    key: "accessories",
    title: "Accessories",
    description: "Small add-ons and everyday favorites.",
    cta: "Browse Accessories",
    category: "accessories",
    view: "products",
    imageKeyword: "wax",
    fallbackCategory: "accessories",
  },
];

const SUBCATEGORY_CARDS: Partial<Record<ShopCategory, CardDef[]>> = {
  "hand-crafts": [
    {
      key: "crochet-hooks",
      title: "Crochet Hooks",
      description: "Smooth hooks for your next project.",
      cta: "Browse Crochet Hooks",
      category: "hand-crafts",
      view: "products",
      search: "crochet hook",
      imageKeyword: "crochet hook",
      fallbackCategory: "hand-crafts",
    },
    {
      key: "seam-rippers",
      title: "Seam Rippers",
      description: "A handy tool for every sewing kit.",
      cta: "Browse Seam Rippers",
      category: "hand-crafts",
      view: "products",
      search: "seam ripper",
      imageKeyword: "seam ripper",
      fallbackCategory: "hand-crafts",
    },
    {
      key: "awls",
      title: "Awls",
      description: "Pointed tools for leather and crafts.",
      cta: "Browse Awls",
      category: "hand-crafts",
      view: "products",
      search: "awl",
      imageKeyword: "awl",
      fallbackCategory: "hand-crafts",
    },
  ],

  "platters-trays": [
    {
      key: "platters",
      title: "Platters",
      description: "Platters for hosting and gifting.",
      cta: "Browse Platters",
      category: "platters-trays",
      view: "products",
      search: "platter",
      imageKeyword: "platter",
      fallbackCategory: "platters-trays",
    },
    {
      key: "trays",
      title: "Trays",
      description: "Trays for coffee tables and charcuterie nights.",
      cta: "Browse Trays",
      category: "platters-trays",
      view: "products",
      search: "tray",
      imageKeyword: "tray",
      fallbackCategory: "platters-trays",
    },
  ],

  "rolling-pins": [
    {
      key: "long-rolling-pins",
      title: "Rolling Pins (Long)",
      description: "Long rolling pins for larger doughs.",
      cta: "Browse Long Pins",
      category: "rolling-pins",
      view: "products",
      search: "long",
      imageKeyword: "rolling pin",
      fallbackCategory: "rolling-pins",
    },
    {
      key: "rolling-pins-medium",
      title: "Rolling Pins (Medium)",
      description: "Medium rolling pins for everyday baking.",
      cta: "Browse Medium Pins",
      category: "rolling-pins",
      view: "products",
      search: "medium",
      imageKeyword: "rolling pin",
      fallbackCategory: "rolling-pins",
    },
    {
      key: "rolling-pins-short",
      title: "Rolling Pins (Short)",
      description: "Short rolling pins for smaller projects.",
      cta: "Browse Short Pins",
      category: "rolling-pins",
      view: "products",
      search: "short",
      imageKeyword: "rolling pin",
      fallbackCategory: "rolling-pins",
    },
  ],

  "vases-vessels": [
    {
      key: "round-vases",
      title: "Round Vases",
      description: "Rounded shapes and softer lines.",
      cta: "Browse Round Vases",
      category: "vases-vessels",
      view: "products",
      search: "round vase",
      imageKeyword: "round vase",
      fallbackCategory: "vases-vessels",
    },
    {
      key: "pillar-vases",
      title: "Pillar Vases",
      description: "Home decor pieces with natural warmth.",
      cta: "Browse Pillar Vases",
      category: "vases-vessels",
      view: "products",
      search: "pillar vase",
      imageKeyword: "pillar vase",
      fallbackCategory: "vases-vessels",
    },
    {
      key: "flared-vases",
      title: "Flared Vases",
      description: "Flared silhouettes and statement shapes.",
      cta: "Browse Flared Vases",
      category: "vases-vessels",
      view: "products",
      search: "flared vase",
      imageKeyword: "flared vase",
      fallbackCategory: "vases-vessels",
    },
  ],
};

export function hasShopSubcategoryCards(category: ShopCategory) {
  const cards = SUBCATEGORY_CARDS[category];
  return Boolean(cards && cards.length);
}

export function getShopTopCategoryHeroCards(
  params: ShopSearchParams,
  products: Array<{ name: string; image: string; category: ShopCategory }>,
): ShopHeroCard[] {
  return TOP_LEVEL_CATEGORY_CARDS.map((def) => ({
    key: def.key,
    title: def.title,
    description: def.description,
    href: cardHref(params, def),
    image: pickCardImage(products, def),
    cta: def.cta,
    priority: Boolean(def.priority),
  }));
}

export function getShopSubcategoryHeroCards(
  params: ShopSearchParams,
  category: ShopCategory,
  products: Array<{ name: string; image: string; category: ShopCategory }>,
): ShopHeroCard[] {
  const defs = SUBCATEGORY_CARDS[category] ?? [];
  return defs.map((def) => ({
    key: def.key,
    title: def.title,
    description: def.description,
    href: cardHref(params, def),
    image: pickCardImage(products, def),
    cta: def.cta,
    priority: Boolean(def.priority),
  }));
}

export function getShopCategoryFilterLinks(
  params: ShopSearchParams,
  categoryOptions: Array<{ value: ShopCategory; label: string }>,
): ShopNavLink[] {
  return categoryOptions.map((opt) => ({
    key: opt.value,
    label: opt.label,
    href: buildShopHref(
      { ...params },
      {
        view: "products",
        search: "",
        sort: "featured",
        category: opt.value,
        price: "all",
        availability: "all",
        deals: "all",
      },
    ),
  }));
}
