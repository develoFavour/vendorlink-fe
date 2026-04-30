"use client";

import { motion } from "framer-motion";
import { CreditCard, LayoutDashboard, MessageCircle, PackagePlus } from "lucide-react";

const features = [
  { title: "Vendor storefronts", text: "Create a local store profile and publish products fast.", icon: LayoutDashboard },
  { title: "Product control", text: "Add, update, hide, or remove products without technical help.", icon: PackagePlus },
  { title: "Flexible checkout", text: "Support cash on delivery, bank transfer, and payment gateway test flows.", icon: CreditCard },
  { title: "Customer contact", text: "Give buyers a direct way to ask questions before and after orders.", icon: MessageCircle },
];

export const FeatureSplit = () => {
  return (
    <section id="features" className="bg-[#dce7e9] px-3 pb-3">
      <div className="rounded-[2rem] bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-blue-600">Marketplace Tools</p>
              <h2 className="max-w-xl text-4xl font-black uppercase leading-[0.92] tracking-tight text-slate-950 md:text-6xl">
                Built for real local trading.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-slate-500">
              VendorLink focuses on the essentials your academic system needs: authentication, product listings, carts, orders, dashboards, and simple payment options for Nigerian local commerce.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-6"
                >
                  <Icon className="mb-8 h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-black text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{feature.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
