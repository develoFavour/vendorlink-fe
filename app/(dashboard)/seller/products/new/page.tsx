import { ProductForm } from "@/components/dashboard/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[#111]">Add New Product</h2>
        <p className="mt-1 text-[13px] font-semibold text-[#111]/40">
          Create a new listing for your storefront catalog.
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
