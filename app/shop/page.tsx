import {
  getSelectedAvailability,
  getSelectedCategory,
  getSelectedDeals,
  getSelectedPriceRange,
  getStorefrontProducts,
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

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const search = (params.search ?? "").trim().toLowerCase();
  const sort = (params.sort ?? "featured").trim().toLowerCase();
  const category = getSelectedCategory(params.category);
  const price = getSelectedPriceRange(params.price);
  const availability = getSelectedAvailability(params.availability);
  const deals = getSelectedDeals(params.deals);

  const products = await getStorefrontProducts();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = !search || product.name.toLowerCase().includes(search);

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
              title="All Products"
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