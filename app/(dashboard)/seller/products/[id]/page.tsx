"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CircleDollarSign, Edit3, Package, Ruler, Tags, Trash2, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, type SellerProduct } from "@/lib/seller-products";
import { productService } from "@/services/product.service";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    productService
      .getProduct(params.id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (!product && !isLoading) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-[#111]">Product not found</h2>
        <Link href="/seller/products" className="mt-6 inline-flex rounded-full bg-[#111] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return <div className="rounded-3xl bg-white p-8 text-sm font-semibold text-[#8A8A86] shadow-sm">Loading product...</div>;
  }

  const inventoryValue = product.price * product.stock;
  const soldCount = product.soldCount || 0;
  const totalInventory = soldCount + product.stock;

  const deleteProduct = async () => {
    const confirmed = window.confirm("Delete this product permanently?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await productService.deleteProduct(product.id);
      toast.success("Product deleted successfully.");
      router.push("/seller/products");
      router.refresh();
    } catch {
      toast.error("Unable to delete product.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link href="/seller/products" className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#111]/40 hover:text-[#C4553A]">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/30">{product.id}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#111]">{product.name}</h2>
          <p className="mt-1 text-[13px] font-semibold text-[#111]/40">{product.shortDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={deleteProduct}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.06] px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-500/[0.1] disabled:cursor-wait disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting" : "Delete"}
          </button>
          <Link
            href={`/seller/products/edit?id=${product.id}`}
            className="flex items-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C4553A]"
          >
            <Edit3 className="h-4 w-4" />
            Edit Product
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="self-start rounded-3xl border border-black/[0.04] bg-white p-5 shadow-sm">
          <div className="relative h-[420px] overflow-hidden rounded-3xl border border-black/[0.03]" style={{ backgroundColor: product.color }}>
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-contain p-8" sizes="420px" priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-black uppercase tracking-wider text-[#111]/35">
                No product image
              </div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(product.gallery.length > 0 ? product.gallery : product.image ? [product.image] : []).slice(0, 4).map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-20 overflow-hidden rounded-2xl bg-[#F3F3F1]">
                <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-contain p-2" sizes="80px" />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Price", value: formatCurrency(product.price), icon: CircleDollarSign },
              { label: "Stock Level", value: `${product.stock} Units`, icon: Warehouse },
              { label: "Sold", value: `${soldCount}/${totalInventory}`, icon: Package },
              { label: "Inventory Value", value: formatCurrency(inventoryValue), icon: Package },
              { label: "Date Listed", value: product.dateListed, icon: CalendarDays },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-sm">
                  <Icon className="mb-4 h-5 w-5 text-[#C4553A]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/30">{stat.label}</p>
                  <p className="mt-1 text-xl font-black tracking-tight text-[#111]">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {[product.category, product.status, product.sku, product.brand].map((item) => (
                <span key={item} className="rounded-full bg-[#FAF9F5] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#111]/50">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoTile label="Old Price" value={product.compareAtPrice ? formatCurrency(product.compareAtPrice) : "Not set"} />
                <InfoTile label="Discount" value={product.discountPercent ? `${product.discountPercent}% off` : "No discount"} />
                <InfoTile label="Weight" value={product.weight} />
              </div>

              <TextBlock title="Description" text={product.description} />
              <TextBlock title="Delivery Note" text={product.deliveryNote} />
            </div>
          </div>

          <div className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChipGroup icon={Ruler} title="Sizes / Variants" items={product.sizes} />
              <ChipGroup icon={Tags} title="Search Tags" items={product.tags} accent />
            </div>
          </div>

          <div className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">Public Specifications</h3>
            <dl className="mt-5 grid gap-3 text-[12px] font-semibold sm:grid-cols-2">
              {[
                ["Package Dimensions", product.specifications.packageDimensions],
                ["Material", product.specifications.material],
                ["Protection", product.specifications.protection],
                ["Care", product.specifications.care],
                ["Date First Available", product.specifications.dateFirstAvailable],
                ["Department", product.specifications.department],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#FAF9F5] p-4">
                  <dt className="text-[#111]/35">{label}</dt>
                  <dd className="mt-1 font-black text-[#111]/70">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl bg-[#FAF9F5] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/30">{label}</p>
      <p className="mt-1 text-lg font-black text-[#111]">{value || "Not set"}</p>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text?: string }) {
  return (
    <div>
      <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">{title}</h3>
      <p className="mt-2 text-[13px] font-semibold leading-7 text-[#111]/50">{text || "No details provided."}</p>
    </div>
  );
}

function ChipGroup({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: typeof Ruler;
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-[13px] font-black uppercase tracking-wider text-[#111]">
        <Icon className="h-4 w-4 text-[#C4553A]" />
        {title}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-4 py-2 text-[11px] font-black ${accent ? "bg-[#C4553A]/[0.06] text-[#C4553A]" : "border border-black/[0.06] bg-[#FAF9F5] text-[#111]/60"}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
