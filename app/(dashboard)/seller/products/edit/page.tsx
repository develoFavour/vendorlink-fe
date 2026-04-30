"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/dashboard/ProductForm";
import type { SellerProduct } from "@/lib/seller-products";
import { productService } from "@/services/product.service";

export default function EditProductPage() {
  const [id] = useState(() =>
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("id") || ""
  );
  const [product, setProduct] = useState<SellerProduct | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;

    productService
      .getProduct(id)
      .then(setProduct)
      .catch(() => setProduct(undefined))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (!id || (!product && !isLoading)) {
    return (
      <div className="rounded-3xl border border-black/[0.04] bg-white p-8 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/30">Product Edit</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#111]">Product not found</h2>
        <p className="mt-2 text-[13px] font-semibold text-[#111]/40">
          Select a product from your catalog before editing.
        </p>
        <Link
          href="/seller/products"
          className="mt-6 inline-flex rounded-full bg-[#111] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C4553A]"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return <div className="rounded-3xl bg-white p-8 text-sm font-semibold text-[#8A8A86] shadow-sm">Loading product...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/30">{product.id}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#111]">Edit Product</h2>
        <p className="mt-1 text-[13px] font-semibold text-[#111]/40">
          Update product details, pricing, stock level, and publishing status.
        </p>
      </div>
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
