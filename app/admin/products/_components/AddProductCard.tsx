import { addProduct } from "../actions";

export function AddProductCard() {
  return (
    <div className="rounded-3xl border border-background/15 bg-background/10 p-6">
      <h3 className="text-2xl font-semibold">Add Product</h3>

      <form action={addProduct} className="mt-4 grid gap-4 md:grid-cols-2">
        <input
          name="name"
          type="text"
          placeholder="Product name"
          className="rounded-xl border border-background/15 bg-sandstone px-4 py-3 text-background outline-none"
          required
        />

        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="Price"
          className="rounded-xl border border-background/15 bg-sandstone px-4 py-3 text-background outline-none"
          required
        />

        <textarea
          name="description"
          placeholder="Write a short product description."
          rows={4}
          className="rounded-xl border border-background/15 bg-sandstone px-4 py-3 text-background outline-none md:col-span-2"
          required
        />

        <div className="space-y-2 md:col-span-2">
          <input
            name="imageFiles"
            type="file"
            accept="image/*"
            multiple
            className="block w-full rounded-xl border border-background/15 bg-sandstone px-4 py-3 text-background outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-background file:px-4 file:py-2 file:text-sandstone"
          />
        </div>

        <input
          name="imageUrl"
          type="text"
          placeholder="Optional: paste a primary image URL instead"
          className="rounded-xl border border-background/15 bg-sandstone px-4 py-3 text-background outline-none md:col-span-2"
        />

        <button
          type="submit"
          className="mx-auto rounded-xl border border-background/15 bg-background px-8 py-3 font-semibold text-sandstone transition hover:opacity-90 md:col-span-2"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}