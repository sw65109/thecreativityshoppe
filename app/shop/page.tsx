import Image from "next/image";
import Link from "next/link";
import {
  CATEGORY_OPTIONS,
  getSelectedAvailability,
  getSelectedCategory,
  getSelectedDeals,
  getSelectedPriceRange,
  getShopSubcategoryHeroCards,
  getShopTopCategoryHeroCards,
  getStorefrontProducts,
  hasShopSubcategoryCards,
  matchesAvailability,
  matchesCategory,
  matchesDeals,
  matchesPriceRange,
  sortProducts,
  type ShopSearchParams,
} from "@/lib/shop";
import { ShopFilterRail } from "./_components/ShopFilterRail";
import { ShopResultsHeader } from "./_components/ShopResultsHeader";
import { ShopProductGrid } from "./_components/ShopProductGrid";

type ShopPageProps = {
  searchParams: Promise<ShopSearchParams>;
};

function getCategoryLabel(category: string) {
  const match = CATEGORY_OPTIONS.find((option) => option.value === category);
  return match?.label ?? "Products";
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const view = (params.view ?? "landing").trim().toLowerCase();
  const isProductsView = view === "products";

  const search = (params.search ?? "").trim().toLowerCase();
  const sort = (params.sort ?? "featured").trim().toLowerCase();
  const category = getSelectedCategory(params.category);
  const price = getSelectedPriceRange(params.price);
  const availability = getSelectedAvailability(params.availability);
  const deals = getSelectedDeals(params.deals);

  const products = await getStorefrontProducts();

  const isDefaultFilters =
    sort === "featured" &&
    price === "all" &&
    availability === "all" &&
    deals === "all";

    const showTopLanding =
    !isProductsView &&
    !search &&
    category === "all" &&
    isDefaultFilters;

    const showSubLanding =
    !isProductsView &&
    !search &&
    category !== "all" &&
    isDefaultFilters &&
    hasShopSubcategoryCards(category);

  if (showTopLanding) {
    const cards = getShopTopCategoryHeroCards(params, products);

    return (
      <div className="bg-[url('/textures/wood_grain_5.png')] bg-cover bg-top-right bg-no-repeat">
        <main className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:max-w-450 2xl:px-12">
          <div className="h-10" />

          <div className="min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-semibold text-black tracking-tight">
                  Shop
                </h1>
                <p className="mt-3 text-black/80">
                  Choose a category to start browsing.
                </p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-4">
              {cards.map((card) => (
                <Link key={card.key} href={card.href} className="group block">
                  <article className="relative h-162.5 flex flex-col overflow-hidden rounded-3xl border border-background/15 bg-sandstone shadow-sm transition hover:shadow-md">
                    <div className="relative h-72 sm:h-80 shrink-0">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, 100vw"
                        priority={card.priority}
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-linear-to-t from-background/70 via-background/25 to-transparent"
                      />
                    </div>

                    <div className="relative p-6 sm:p-8 flex flex-col h-full">
                      <p className="text-xs uppercase tracking-[0.3em] text-walnut/70">
                        Category
                      </p>

                      <h2 className="mt-2 text-3xl font-semibold text-walnut sm:text-4xl">
                        {card.title}
                      </h2>

                      <p className="mt-3 max-w-xl text-base text-walnut/80 sm:text-lg">
                        {card.description}
                      </p>

                      <span className="mt-auto inline-flex rounded-full bg-background px-6 py-3 font-semibold text-sandstone transition group-hover:opacity-90">
                        {card.cta}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          <div className="h-32" />
        </main>
      </div>
    );
  }

  if (showSubLanding) {
    const subCards = getShopSubcategoryHeroCards(params, category, products);
    const categoryLabel = getCategoryLabel(category);

    return (
      <div className="bg-[url('/textures/wood_grain_5.png')] bg-cover bg-top-right bg-no-repeat">
        <main className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:max-w-450 2xl:px-12">
          <div className="h-10" />

          <div className="min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-semibold text-black tracking-tight">
                  {categoryLabel}
                </h1>
                <p className="mt-3 text-black/80">
                  Choose a section to start browsing.
                </p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-4">
              {subCards.map((card) => (
                <Link key={card.key} href={card.href} className="group block">
                  <article className="relative h-162.5 flex flex-col overflow-hidden rounded-3xl border border-background/15 bg-sandstone shadow-sm transition hover:shadow-md">
                    <div className="relative h-72 sm:h-80 shrink-0">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, 100vw"
                        priority={card.priority}
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-linear-to-t from-background/70 via-background/25 to-transparent"
                      />
                    </div>

                    <div className="relative p-6 sm:p-8 flex flex-col h-full">
                      <p className="text-xs uppercase tracking-[0.3em] text-walnut/70">
                        Category
                      </p>

                      <h2 className="mt-2 text-3xl font-semibold text-walnut sm:text-4xl">
                        {card.title}
                      </h2>

                      <p className="mt-3 max-w-xl text-base text-walnut/80 sm:text-lg">
                        {card.description}
                      </p>

                      <span className="mt-auto inline-flex rounded-full bg-background px-6 py-3 font-semibold text-sandstone transition group-hover:opacity-90">
                        {card.cta}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          <div className="h-32" />
        </main>
      </div>
    );
  }

  const searchTerms = search
  .split(/\s+/)
  .map((term) => term.trim())
  .filter(Boolean);

const filteredProducts = products.filter((product) => {
  const productName = product.name.toLowerCase();

  const matchesSearch =
    searchTerms.length === 0 ||
    searchTerms.every((term) => productName.includes(term));

  return (
    matchesSearch &&
    matchesCategory(product, category) &&
    matchesPriceRange(product, price) &&
    matchesAvailability(product, availability) &&
    matchesDeals(product, deals)
  );
});

  const sortedProducts = sortProducts(filteredProducts, sort);

  return (
    <div className="bg-[url('/textures/wood_grain_5.png')] bg-cover bg-top-right bg-no-repeat">
      <main className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:max-w-450 2xl:px-12">
        <div className="h-10" />

        <div className="grid grid-cols-1 gap-48 lg:grid-cols-[240px_1fr]">
          <ShopFilterRail params={params} category={category} price={price} />

          <div className="min-w-0">
            <ShopResultsHeader
              params={params}
              title={category === "all" ? "All Products" : getCategoryLabel(category)}
              resultCount={sortedProducts.length}
              search={search}
              category={category}
              price={price}
              availability={availability}
              deals={deals}
            />

            <ShopProductGrid products={sortedProducts} />
          </div>
        </div>

        <div className="h-32" />
      </main>
    </div>
  );
}