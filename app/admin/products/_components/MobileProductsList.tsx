import Image from "next/image";
import { deleteProduct } from "../actions";
import type { ProductView } from "../_lib/types";

export function MobileProductsList({ productViews }: { productViews: ProductView[] }) {
  return (
    <div className="grid gap-4 md:hidden">
      {productViews.length ? (
        productViews.map(({ product, primaryImage, galleryThumbs, remainingThumbs }) => (
          <div
            key={product.id}
            className="min-w-65 rounded-3xl border border-background/15 bg-background/10 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{product.name}</p>
                <p className="mt-1 text-sm text-background/75">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>

              {primaryImage ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    sizes="64px"
                    loading="eager"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-background/15 text-xs text-background/60">
                  No image
                </div>
              )}
            </div>

            <div
              className="mt-3 text-sm text-background/75 overflow-hidden wrap-break-word text-wrap"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {product.description || "No description"}
            </div>

            <div className="mt-3">
              {galleryThumbs.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  {galleryThumbs.map((image) => (
                    <Image
                      key={image.id}
                      src={image.image_url}
                      alt={product.name}
                      width={40}
                      height={40}
                      loading="eager"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ))}

                  {remainingThumbs > 0 ? (
                    <span className="text-xs text-background/60">
                      +{remainingThumbs} more
                    </span>
                  ) : null}
                </div>
              ) : (
                <span className="text-sm text-background/60">No gallery images</span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <label
                htmlFor={`edit-${product.id}`}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-background/15 bg-background px-3 py-2 text-sm font-semibold text-sandstone transition hover:opacity-90"
              >
                Edit
              </label>

              <form action={deleteProduct}>
                <input type="hidden" name="id" value={product.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-background/15 px-3 py-2 text-sm transition hover:bg-background hover:text-sandstone"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-3xl border border-background/15 bg-background/10 p-6 text-background/70">
          No products found.
        </div>
      )}
    </div>
  );
}