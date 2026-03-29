import Image from "next/image";
import { deleteProduct } from "../actions";
import type { ProductView } from "../_lib/types";

export function DesktopProductsTable({
  productViews,
}: {
  productViews: ProductView[];
}) {
  return (
    <div className="hidden w-full min-w-0 max-w-full overflow-x-auto rounded-3xl border border-background/15 md:block">
      <table className="min-w-225 w-full border-collapse bg-background/10">
        <thead>
          <tr className="border-b border-background/15 text-left text-sm text-background/60">
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Description</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Primary</th>
            <th className="px-6 py-4">Gallery</th>
            <th className="px-6 py-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {productViews.length ? (
            productViews.map(
              ({ product, primaryImage, galleryThumbs, remainingThumbs }) => (
                <tr
                  key={product.id}
                  className="border-b border-background/10 align-top"
                >
                  <td className="px-6 py-4 font-medium">{product.name}</td>

                  <td className="px-4 py-3 text-sm text-background/75">
                    <div className="max-w-130 [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
                      {product.description || "No description"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    ${Number(product.price).toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    {primaryImage ? (
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          sizes="80px"
                          loading="eager"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      "No image"
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {galleryThumbs.length ? (
                      <div className="flex flex-wrap gap-2">
                        {galleryThumbs.map((image) => (
                          <Image
                            key={image.id}
                            src={image.image_url}
                            alt={product.name}
                            width={48}
                            height={48}
                            loading="eager"
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ))}

                        {remainingThumbs > 0 ? (
                          <span className="self-center text-xs text-background/60">
                            +{remainingThumbs} more
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-sm text-background/60">
                        No gallery images
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
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
                  </td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td className="px-6 py-6 text-background/70" colSpan={6}>
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
