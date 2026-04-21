import Link from "next/link";
import {
  buildShopHref,
  type AvailabilityFilter,
  type DealsFilter,
  type PriceRange,
  type ShopCategory,
  type ShopSearchParams,
} from "@/lib/shop";

type ShopResultsHeaderProps = {
  params: ShopSearchParams;
  title: string;
  resultCount: number;
  search: string;
  category: ShopCategory;
  price: PriceRange;
  availability: AvailabilityFilter;
  deals: DealsFilter;
};

export function ShopResultsHeader({
  params,
  title,
  resultCount,
  search,
  category,
  price,
  availability,
  deals,
}: ShopResultsHeaderProps) {
  const showClear =
    Boolean(search) ||
    category !== "all" ||
    price !== "all" ||
    availability !== "all" ||
    deals !== "all";

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-4xl font-semibold text-black tracking-tight">
          {title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-black/80 ">
          <p>{resultCount} results</p>

          {showClear ? (
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
    </div>
  );
}