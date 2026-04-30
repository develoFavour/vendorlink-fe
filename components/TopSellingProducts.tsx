"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { formatCurrency, type SellerProduct, sellerProducts } from "@/lib/seller-products";

export const TopSellingProducts = () => {
  const [items, setItems] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    productService
      .getPublicProducts({ limit: 4 })
      .then((result) => {
        if (!isActive) return;
        if (result.products && result.products.length > 0) {
          setItems(result.products.slice(0, 4));
        } else {
          // Fallback to initial mock data if database is empty
          setItems(sellerProducts.slice(0, 4));
        }
      })
      .catch(() => {
        if (!isActive) return;
        // Fallback to mock data if backend request fails
        setItems(sellerProducts.slice(0, 4));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section id="shop" className="bg-[#FAF9F5]/40 px-5 py-24 lg:px-8 border-t border-black/[0.02]">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#C4553A]"
            >
              Curated Picks
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-[900] tracking-[-0.03em] text-[#111] sm:text-5xl"
            >
              Top Selling Products
            </motion.h2>
          </div>
          <Link href="/products">
            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="hidden rounded-full border border-black/[0.08] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-wider text-[#111] shadow-sm transition-all hover:bg-[#111] hover:text-white hover:border-transparent sm:flex items-center gap-1.5 group"
            >
              Browse Catalog
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.button>
          </Link>
        </div>

        {/* Dynamic Showcase Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            /* ── Skeleton Loading ── */
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="animate-pulse rounded-[24px] border border-black/[0.03] bg-white p-4.5 shadow-sm">
                <div className="h-60 rounded-2xl bg-black/[0.02]" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-2/3 rounded-md bg-black/[0.02]" />
                  <div className="h-3.5 w-1/3 rounded-md bg-black/[0.02]" />
                </div>
              </div>
            ))
          ) : (
            /* ── Live Product List ── */
            items.map((item, index) => {
              const hasDiscount = item.compareAtPrice && item.compareAtPrice > item.price;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group relative flex flex-col justify-between rounded-[24px] border border-black/[0.03] bg-white p-4.5 shadow-sm shadow-black/[0.01] hover:border-black/[0.08] hover:shadow-md transition-all duration-300"
                >
                  <Link href={`/products/${item.id}`} className="block">
                    {/* Image Area */}
                    <div className="relative overflow-hidden rounded-2xl flex h-60 items-center justify-center bg-[#FAF9F5]/70 border border-black/[0.01]">
                      {hasDiscount && (
                        <span className="absolute left-4 top-4 z-10 rounded-lg bg-[#C4553A] px-2.5 py-1 text-[9px] font-black tracking-wide text-white shadow-sm">
                          -{item.discountPercent}%
                        </span>
                      )}
                      
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="240px"
                        className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/90 border border-black/[0.04] backdrop-blur-sm px-3 py-1 text-[9px] font-black tracking-wider uppercase text-[#111]/70 shadow-sm">
                        {item.category}
                      </span>
                    </div>

                    {/* Metadata Content */}
                    <div className="mt-4 flex items-start justify-between px-0.5">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-black tracking-tight text-[#111] line-clamp-1 group-hover:text-[#C4553A] transition-colors duration-300">
                          {item.name}
                        </h3>
                        <div className="mt-1 flex items-baseline gap-2">
                          <p className="text-[13px] font-[800] text-[#C4553A]">
                            {formatCurrency(item.price)}
                          </p>
                          {hasDiscount && (
                            <p className="text-[10px] font-bold text-[#111]/25 line-through">
                              {formatCurrency(item.compareAtPrice!)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#C4553A]/20 bg-[#C4553A]/5 text-[#C4553A] transition-all duration-300 group-hover:bg-[#C4553A] group-hover:text-white shadow-sm">
                        <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
