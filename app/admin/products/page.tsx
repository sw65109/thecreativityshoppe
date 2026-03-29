import { loadProducts } from "./_lib/loadProducts";
import { buildProductViews } from "./_lib/buildProductViews";
import { AddProductCard } from "./_components/AddProductCard";
import { MobileProductsList } from "./_components/MobileProductsList";
import { DesktopProductsTable } from "./_components/DesktopProductsTable";
import { EditProductModals } from "./_components/EditProductModals";

export default async function AdminProductsPage() {
  const { products, error } = await loadProducts();

  if (error) {
    return (
      <section className="space-y-8 text-background">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-background/60">
            Admin
          </p>
          <h2 className="mt-2 text-4xl font-semibold">Products</h2>
          <p className="mt-3 text-red-700">Failed to load products: {error}</p>
        </div>
      </section>
    );
  }

  const productViews = buildProductViews(products);

  return (
    <section className="space-y-8 text-background max-w-full overflow-x-hidden">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-background/60">
          Admin
        </p>
        <h2 className="mt-2 text-4xl font-semibold">Products</h2>
      </div>

      <AddProductCard />

      <MobileProductsList productViews={productViews} />

      <DesktopProductsTable productViews={productViews} />

      <EditProductModals productViews={productViews} />
    </section>
  );
}