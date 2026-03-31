import Image from "next/image";
import { updateProduct } from "../actions";
import type { ProductView } from "../_lib/types";

export function EditProductModals({ productViews }: { productViews: ProductView[] }) {
  return (
    <>
      {productViews.map(({ product, galleryImages, showFlags }) => (
        <div key={product.id}>
          <input
            id={`edit-${product.id}`}
            type="checkbox"
            className="peer sr-only"
          />

          <label
            htmlFor={`edit-${product.id}`}
            className="fixed inset-0 z-40 hidden bg-background/40 peer-checked:block"
          />

          <div className="fixed inset-0 z-50 hidden items-start justify-center overflow-auto p-4 peer-checked:flex">
            <div className="w-full max-w-2xl rounded-2xl border border-background/15 bg-sandstone p-4 text-background">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Edit product</p>
                <label
                  htmlFor={`edit-${product.id}`}
                  className="cursor-pointer rounded-lg border border-background/15 bg-background px-3 py-1 text-sm text-sandstone"
                >
                  Close
                </label>
              </div>

              <form action={updateProduct} className="mt-4 space-y-3">
                <input type="hidden" name="id" value={product.id} />

                <input
                  name="name"
                  type="text"
                  defaultValue={product.name}
                  className="w-full rounded-xl border border-background/15 bg-sandstone px-4 py-2 text-background outline-none"
                  required
                />

                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={Number(product.price)}
                  className="w-full rounded-xl border border-background/15 bg-sandstone px-4 py-2 text-background outline-none"
                  required
                />

                <textarea
                  name="description"
                  rows={4}
                  defaultValue={product.description ?? ""}
                  className="w-full rounded-xl border border-background/15 bg-sandstone px-4 py-2 text-background outline-none"
                  required
                />

                {galleryImages.length ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-background/60">
                      Images
                    </p>

                    <div className="grid gap-2 md:grid-cols-2">
                      {galleryImages.map((image) => (
                        <div
                          key={image.id}
                          className="flex items-center gap-3 rounded-xl border border-background/15 bg-background/5 p-2"
                        >
                          <Image
                            src={image.image_url}
                            alt={product.name}
                            width={48}
                            height={48}
                            loading="eager"
                            className="h-12 w-12 rounded-lg object-cover"
                          />

                          <div className="flex-1 space-y-2 text-xs text-background/75">
                            <label className="flex items-center justify-between gap-2">
                              <span>Wood tag</span>
                              <input
                                name={`image_variant_${image.id}`}
                                type="text"
                                defaultValue={image.variant ?? ""}
                                placeholder="Example: Maple"
                                className="w-40 rounded-lg border border-background/15 bg-sandstone px-2 py-1 text-background outline-none"
                              />
                            </label>

                            <label className="flex items-center justify-between gap-2">
                              <span>Primary</span>
                              <input
                                type="radio"
                                name="primary_image_id"
                                value={image.id}
                                defaultChecked={image.is_primary}
                              />
                            </label>

                            <label className="flex items-center justify-between gap-2">
                              <span>Remove</span>
                              <input
                                type="checkbox"
                                name="remove_image_ids"
                                value={image.id}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-background/60">
                    Add images
                  </p>

                  <input
                    name="newImagesVariant"
                    type="text"
                    placeholder="Wood tag for these new images (optional)"
                    className="block w-full rounded-xl border border-background/15 bg-sandstone px-4 py-2 text-background outline-none"
                  />

                  <input
                    name="newImageFiles"
                    type="file"
                    accept="image/*"
                    multiple
                    className="block w-full rounded-xl border border-background/15 bg-sandstone px-4 py-2 text-background outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-background file:px-4 file:py-2 file:text-sandstone"
                  />
                </div>

                {showFlags ? (
                  <div className="flex flex-wrap gap-4 pt-1 text-sm">
                    {typeof product.in_stock === "boolean" ? (
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="in_stock"
                          defaultChecked={product.in_stock}
                        />
                        In stock
                      </label>
                    ) : null}

                    {typeof product.on_sale === "boolean" ? (
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="on_sale"
                          defaultChecked={product.on_sale}
                        />
                        On sale
                      </label>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="w-full rounded-lg border border-background/15 bg-background px-3 py-2 text-sm font-semibold text-sandstone transition hover:opacity-90"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}