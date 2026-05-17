import Link from "next/link";
import { ShopParamCheckbox } from "@/app/components/ShopSortSelect";
import {
  CATEGORY_OPTIONS,
  PRICE_OPTIONS,
  buildShopHref,
  getShopCategoryFilterLinks,
  type PriceRange,
  type ShopCategory,
  type ShopSearchParams,
} from "@/lib/shop";

type ShopFilterRailProps = {
  params: ShopSearchParams;
  category: ShopCategory;
  price: PriceRange;
};

export function ShopFilterRail({ params, price }: ShopFilterRailProps) {
  const currentHref = buildShopHref(params, {});
  const categoryLinks = getShopCategoryFilterLinks(params, CATEGORY_OPTIONS);

  return (
    <aside className="text-black">
      <h2 className="text-2xl font-semibold">Browse by category</h2>

      <div className="mt-4 space-y-3 text-xl">
        {categoryLinks.map((link) => {
          const isActive = currentHref === link.href;

          return (
            <Link
              key={link.key}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "block font-semibold" : "block"}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 border-t border-black/50" />

      <details className="mt-6 text-xl">
        <summary className="flex cursor-pointer items-center justify-between font-semibold">
          <span>Price range ($)</span>
          <span aria-hidden="true">▾</span>
        </summary>

        <div className="mt-4 space-y-3 text-xl">
          {PRICE_OPTIONS.map((option) => {
            const isActive = price === option.value;

            return (
              <Link
                key={option.value}
                href={buildShopHref(params, { price: option.value, view: "products" })}
                className={isActive ? "block font-semibold" : "block"}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </details>

      <div className="mt-6 border-t border-black/50" />

      <details className="mt-6 text-xl">
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
              className="h-4 w-4 rounded border border-black bg-transparent accent-sandstone"
              aria-label="Shipping only"
            />
            <span className="font-semibold">Shipping</span>
          </label>
        </div>
      </details>

      <div className="mt-6 border-t border-black/50" />

      <details className="mt-6 text-xl">
        <summary className="flex cursor-pointer items-center justify-between font-semibold">
          <span>Availability</span>
          <span aria-hidden="true">▾</span>
        </summary>

        <div className="mt-4">
          <ShopParamCheckbox param="availability" checkedValue="instock" label="In Stock" />
        </div>
      </details>

      <div className="mt-6 border-t border-black/50" />

      <details className="mt-6 text-xl">
        <summary className="flex cursor-pointer items-center justify-between font-semibold">
          <span>Sale and Deals</span>
          <span aria-hidden="true">▾</span>
        </summary>

        <div className="mt-4">
          <ShopParamCheckbox param="deals" checkedValue="sale" label="On Sale" />
        </div>
      </details>
    </aside>
  );
}