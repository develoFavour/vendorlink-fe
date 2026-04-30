import { ProductMarketplace } from "@/components/shop/ProductMarketplace";

export default function PublicProductsPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F5] px-5 pb-5 pt-24">
      <ProductMarketplace mode="public" />
    </main>
  );
}
