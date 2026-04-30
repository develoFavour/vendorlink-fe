"use client";

import { motion } from "framer-motion";
import {
  Shirt,
  Cpu,
  Apple,
  Home,
  Sparkles,
  BookOpen,
} from "lucide-react";

const categories = [
  { name: "Fashion", icon: Shirt, count: "42 vendors" },
  { name: "Electronics", icon: Cpu, count: "28 vendors" },
  { name: "Groceries", icon: Apple, count: "35 vendors" },
  { name: "Home & Living", icon: Home, count: "19 vendors" },
  { name: "Beauty", icon: Sparkles, count: "24 vendors" },
  { name: "Books", icon: BookOpen, count: "12 vendors" },
];

export const CategoriesSection = () => {
  return (
    <section id="categories" className="bg-[#FAF9F5] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#C4553A]"
          >
            Collections
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-[800] tracking-[-0.02em] text-[#111] sm:text-5xl"
          >
            Shop by Category
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group flex cursor-pointer flex-col items-start rounded-2xl border border-black/[0.04] bg-white p-6 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)]"
              >
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF9F5] text-[#111]/45 transition-colors group-hover:bg-[#C4553A]/10 group-hover:text-[#C4553A]">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-[13px] font-bold text-[#111]">
                  {cat.name}
                </h3>
                <p className="mt-1 text-[11px] font-medium text-[#111]/30">
                  {cat.count}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
