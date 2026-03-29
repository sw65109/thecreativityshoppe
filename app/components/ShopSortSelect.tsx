"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "featured", label: "Sort by: Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "alphabetical", label: "Alphabetical (A-Z)" },
  { value: "newest", label: "Newest" },
];

type ShopToggleParam = "availability" | "deals";

type ShopParamCheckboxProps = {
  param: ShopToggleParam;
  checkedValue: string;
  label: string;
  ariaLabel?: string;
};

export function ShopParamCheckbox({
  param,
  checkedValue,
  label,
  ariaLabel,
}: ShopParamCheckboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isChecked = (searchParams.get(param) ?? "") === checkedValue;

  function handleCheckedChange(nextChecked: boolean) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextChecked) {
      params.set(param, checkedValue);
    } else {
      params.delete(param);
    }

    const queryString = params.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop");
  }

  return (
    <label className="flex cursor-pointer select-none items-center gap-3">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(event) => handleCheckedChange(event.target.checked)}
        className="h-4 w-4 rounded border border-maple bg-transparent accent-sandstone"
        aria-label={ariaLabel ?? label}
      />
      <span className="font-semibold">{label}</span>
    </label>
  );
}

export default function ShopSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "featured";

  function handleSortChange(nextSort: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextSort === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }

    const queryString = params.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop");
  }

  return (
    <select
      value={currentSort}
      onChange={(event) => handleSortChange(event.target.value)}
      className="border border-maple bg-maple text-walnut font-medium px-4 py-2 rounded-lg shadow-sm"
      aria-label="Sort products"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}