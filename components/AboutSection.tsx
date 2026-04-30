"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PackagePlus,
  CreditCard,
  MessageCircle,
} from "lucide-react";

const features = [
  {
    title: "Storefronts",
    text: "Set up a clean vendor storefront and list products in seconds.",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    text: "Easily update prices, edit descriptions, or hide items.",
    icon: PackagePlus,
  },
  {
    title: "Checkout",
    text: "Seamlessly handle digital bank transfers or cash on delivery.",
    icon: CreditCard,
  },
  {
    title: "Messaging",
    text: "Chat directly with local buyers to confirm delivery details.",
    icon: MessageCircle,
  },
];

export const AboutSection = () => {
  return (
    <section id="features" className="bg-[#FAF9F5] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#C4553A]"
            >
              The Platform
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-[800] tracking-[-0.02em] text-[#111] sm:text-5xl"
            >
              Designed for simple,
              <br />
              effective local trading.
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[15px] leading-[1.7] text-[#111]/50"
          >
            VendorLink bridges the gap between neighborhood commerce and modern
            software. We give small local businesses clean digital toolsets to reach
            everyone in their community without complex technical setups.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-2xl border border-black/[0.04] bg-white p-6 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)]"
              >
                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF9F5]">
                  <Icon className="h-5 w-5 text-[#111]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-bold text-[#111]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-[#111]/40">
                  {feature.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
