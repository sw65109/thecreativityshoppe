import Image from "next/image";
import Link from "next/link";
import ShopSortSelect, {
  ShopParamCheckbox,
} from "@/app/components/ShopSortSelect";
import {
  CATEGORY_OPTIONS,
  PRICE_OPTIONS,
  buildShopHref,
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
    const matchesSearch =
      !search || product.name.toLowerCase().includes(search);

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
    <div className="w-full bg-[url('/textures/wood_grain.jpg')] bg-cover bg-top-right bg-no-repeat">
      <main className="w-full">
        <div className="h-20" />

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 gap-12 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="text-maple">
            <h2 className="text-lg font-semibold">Browse by category</h2>

            <div className="mt-4 space-y-3">
              {CATEGORY_OPTIONS.map((option) => {
                const isActive = category === option.value;

                return (
                  <Link
                    key={option.value}
                    href={buildShopHref(params, { category: option.value })}
                    className={isActive ? "block font-semibold" : "block"}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 border-t border-maple/50" />

            <details className="mt-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold">
                <span>Price range ($)</span>
                <span aria-hidden="true">▾</span>
              </summary>

              <div className="mt-4 space-y-3">
                {PRICE_OPTIONS.map((option) => {
                  const isActive = price === option.value;

                  return (
                    <Link
                      key={option.value}
                      href={buildShopHref(params, { price: option.value })}
                      className={isActive ? "block font-semibold" : "block"}
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </details>

            <div className="mt-6 border-t border-maple/50" />

            <details className="mt-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold">
                <span>How to get it</span>
                <span aria-hidden="true">▾</span>
              </summary>

              <div className="mt-4">
                <label className="flex select-none items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    disabled
                    className="h-4 w-4 rounded border border-maple bg-transparent accent-sandstone"
                    aria-label="Shipping only"
                  />
                  <span className="font-semibold">Shipping</span>
                </label>
              </div>
            </details>

            <div className="mt-6 border-t border-maple/50" />

            <details className="mt-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold">
                <span>Availability</span>
                <span aria-hidden="true">▾</span>
              </summary>

              <div className="mt-4">
                <ShopParamCheckbox
                  param="availability"
                  checkedValue="instock"
                  label="In Stock"
                />
              </div>
            </details>

            <div className="mt-6 border-t border-maple/50" />

            <details className="mt-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold">
                <span>Sale and Deals</span>
                <span aria-hidden="true">▾</span>
              </summary>

              <div className="mt-4">
                <ShopParamCheckbox
                  param="deals"
                  checkedValue="sale"
                  label="On Sale"
                />
              </div>
            </details>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-4xl font-semibold text-maple tracking-tight">
                  All Products
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-maple/80">
                  <p>{sortedProducts.length} results</p>

                  {search ||
                  category !== "all" ||
                  price !== "all" ||
                  availability !== "all" ||
                  deals !== "all" ? (
                    <Link
                      href={buildShopHref(params, {
                        category: "all",
                        price: "all",
                        availability: "all",
                        deals: "all",
                      })}
                      className="underline underline-offset-4"
                    >
                      Clear all
                    </Link>
                  ) : null}

                  {search ? <p>Showing results for {params.search}</p> : null}
                </div>
              </div>

              <ShopSortSelect />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-3">
              {sortedProducts.length ? (
                sortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group"
                  >
                    <div className="bg-driftwood rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                      <div className="relative w-full h-64">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          loading="eager"
                          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-walnut group-hover:text-foreground transition">
                          {product.name}
                        </h3>

                        <p className="text-chestnut mt-3 font-medium">
                          ${product.price}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full rounded-xl border border-maple/40 bg-driftwood p-8 text-center text-walnut">
                  <h2 className="text-2xl font-semibold">
                    No matching products
                  </h2>
                  <p className="mt-3 text-walnut/80">
                    Try a different search term or browse the full shop.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/shop"
                      className="inline-block rounded-full bg-background px-6 py-3 font-semibold text-sandstone transition hover:opacity-90"
                    >
                      View All Products
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-32" />
      </main>
    </div>
  );
}
