"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

type AddToCartButtonProps = {
  id: string;
  name: string;
  price: number;
  image: string;

  variantLabel?: string;
  variantOptions?: string[];

  secondaryVariantLabel?: string;
  secondaryVariantOptions?: string[];
};

function normalizeVariant(value: string) {
  return value.trim().toLowerCase();
}

function coerceToOption(value: string, options: string[]) {
  const target = normalizeVariant(value);
  if (!target) return null;

  for (const option of options) {
    if (normalizeVariant(option) === target) return option;
  }

  return null;
}

export default function AddToCartButton({
  id,
  name,
  price,
  image,
  variantLabel,
  variantOptions,
  secondaryVariantLabel,
  secondaryVariantOptions,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [added, setAdded] = useState(false);

  const effectiveVariant = useMemo(() => {
    const options = variantOptions ?? [];
    if (!options.length) return "";

    const fromUrl = searchParams.get("wood") ?? "";
    return coerceToOption(fromUrl, options) ?? options[0] ?? "";
  }, [searchParams, variantOptions]);

  const effectiveSecondaryVariant = useMemo(() => {
    const options = secondaryVariantOptions ?? [];
    if (!options.length) return "";

    const fromUrl = searchParams.get("mechanism") ?? "";
    return coerceToOption(fromUrl, options) ?? options[0] ?? "";
  }, [searchParams, secondaryVariantOptions]);

  function setVariantInUrl(next: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (next) {
      params.set("wood", next);
    } else {
      params.delete("wood");
    }

    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  function setSecondaryVariantInUrl(next: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (next) {
      params.set("mechanism", next);
    } else {
      params.delete("mechanism");
    }

    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  function handleAddToCart() {
    const variantParts: string[] = [];

    if (variantOptions?.length) {
      variantParts.push(`${variantLabel ?? "Wood"}: ${effectiveVariant}`);
    }

    if (secondaryVariantOptions?.length) {
      variantParts.push(
        `${secondaryVariantLabel ?? "Mechanism"}: ${effectiveSecondaryVariant}`,
      );
    }

    const combinedVariant = variantParts.length
      ? variantParts.join(" • ")
      : undefined;

    addItem({
      id,
      name,
      price,
      image,
      quantity: 1,
      variant: combinedVariant,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {variantOptions?.length ? (
        <div className="max-w-sm">
          <label className="mb-2 block text-sm font-semibold text-background/80">
            {variantLabel ?? "Wood"}
          </label>
          <select
            value={effectiveVariant}
            onChange={(event) => setVariantInUrl(event.target.value)}
            className="w-full rounded-xl border border-background/20 bg-sandstone/70 px-4 py-3 text-background outline-none"
          >
            {variantOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {secondaryVariantOptions?.length ? (
        <div className="max-w-sm">
          <label className="mb-2 block text-sm font-semibold text-background/80">
            {secondaryVariantLabel ?? "Mechanism"}
          </label>
          <select
            value={effectiveSecondaryVariant}
            onChange={(event) => setSecondaryVariantInUrl(event.target.value)}
            className="w-full rounded-xl border border-background/20 bg-sandstone/70 px-4 py-3 text-background outline-none"
          >
            {secondaryVariantOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded-full bg-background px-8 py-3 font-semibold text-sandstone transition hover:opacity-90"
        >
          {added ? "Added to Cart" : "Add to Cart"}
        </button>

        <Link
          href="/cart"
          className="rounded-full border border-background/20 px-8 py-3 font-semibold text-background transition hover:bg-background hover:text-sandstone"
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}