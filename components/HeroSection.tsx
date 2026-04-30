"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, ShieldCheck, MapPin } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#FAF9F5] px-6 pb-16 pt-28 lg:px-12 lg:pb-24 lg:pt-36">
      {/* Dynamic Background Accents */}
      <div className="absolute -left-48 top-12 h-96 w-96 rounded-full bg-[#C4553A]/[0.02] blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-[#FAF9F5] blur-2xl pointer-events-none" />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          
          {/* Left Column: Heading & Content */}
          <div className="relative z-10">
            {/* Vetted Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.04] bg-[#FFFFFF]/60 px-4 py-1.5 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4553A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C4553A]"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#111]/60">
                120+ Vetted Local Shops Live
              </span>
            </motion.div>

            {/* Headline */}
            <div className="max-w-xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[clamp(2.5rem,5.5vw,4.8rem)] font-black leading-[0.92] tracking-[-0.03em] text-[#111]"
              >
                Your neighborhood
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#111] via-[#C4553A] to-[#111] bg-size-200 animate-gradient">
                  market, online.
                </span>
              </motion.h1>

              {/* Sub-headline with serif touch */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-[16px] leading-[1.6] text-[#111]/50 font-medium"
              >
                Shop direct. Support your local community.{" "}
                <span className="font-serif italic text-[#C4553A] font-[500]">
                  Delivered straight to your doorstep.
                </span>
              </motion.p>
            </div>

            {/* Interactive Local Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 max-w-lg rounded-2xl border border-black/[0.05] bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.02)] flex items-center gap-2 group focus-within:border-black/15 transition-all duration-300"
            >
              <div className="pl-3 flex items-center gap-2 text-[#111]/30 group-focus-within:text-[#C4553A] transition-colors">
                <Search className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search products, groceries, local clothing..."
                className="w-full bg-transparent py-2.5 text-[13px] font-semibold text-[#111] outline-none placeholder:text-[#111]/30"
              />
              <button className="hidden sm:flex items-center gap-1.5 rounded-xl bg-[#111] px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#C4553A]">
                <span>Search</span>
              </button>
            </motion.div>

            {/* Quick Suggestions Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#111]/40"
            >
              <span>Popular:</span>
              {["Ankara Prints", "Groceries", "Artisan Bags", "Earbuds"].map((tag) => (
                <button
                  key={tag}
                  className="rounded-full border border-black/[0.04] bg-white/60 px-3 py-1 text-[#111]/50 transition-all duration-300 hover:border-black/[0.15] hover:text-[#111]"
                >
                  {tag}
                </button>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link href="/auth/register">
                <button className="group flex items-center gap-2.5 rounded-full bg-[#111] px-8 py-4 text-[12px] font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#C4553A] hover:shadow-[0_12px_24px_rgba(196,85,58,0.15)]">
                  <span>Start Shopping</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/auth/register/seller">
                <button className="rounded-full border border-black/[0.06] bg-white/50 px-8 py-4 text-[12px] font-bold uppercase tracking-wider text-[#111] backdrop-blur-sm transition-all duration-300 hover:border-black/[0.15] hover:bg-white">
                  <span>Open a Store</span>
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Premium Framed Lifestyle Photography */}
          <div className="relative flex justify-center lg:justify-end">
            
            {/* The Main Portrait Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative w-full max-w-[420px] aspect-[4/5] rounded-[2.5rem] border border-black/[0.03] bg-white p-3.5 shadow-[0_32px_64px_rgba(0,0,0,0.04)]"
            >
              {/* Image Frame */}
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#FAF9F5]">
                <Image
                  src="/hero_lifestyle.png"
                  alt="Premium Local E-Commerce Experience"
                  fill
                  sizes="(max-w-7xl) 100vw"
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* Subtle Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Badge 1: Real-time active store indicator */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-6 top-[20%] flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-white/80 p-4 shadow-[0_16px_32px_rgba(0,0,0,0.06)] backdrop-blur-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C4553A]/10 text-[#C4553A]">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#111]/40">Featured Vendor</p>
                  <p className="text-[13px] font-black text-[#111]">Lagos Couture</p>
                </div>
              </motion.div>

              {/* Floating Badge 2: Premium Product showcase */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 bottom-[10%] flex max-w-[200px] items-center gap-3 rounded-2xl border border-black/[0.04] bg-white/80 p-3.5 shadow-[0_16px_32px_rgba(0,0,0,0.06)] backdrop-blur-md"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/[0.03] bg-[#E8EDF3]">
                  <Image
                    src="/product_headphones.png"
                    alt="Premium Product Shot"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h3 className="text-[12px] font-black text-[#111] line-clamp-1">Wireless Pro</h3>
                  <p className="text-[11px] font-bold text-[#C4553A]">₦15,000</p>
                  <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#111]/40">
                    <MapPin className="h-2.5 w-2.5 text-[#C4553A]" />
                    <span>Lekki, Lagos</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge 3: Trust Stamp */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-6 left-12 flex items-center gap-2.5 rounded-full border border-black/[0.04] bg-[#FFFFFF] px-4.5 py-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.04)]"
              >
                <ShieldCheck className="h-4.5 w-4.5 text-[#C4553A]" />
                <span className="text-[11px] font-bold tracking-wider text-[#111]">
                  Vetted Quality Guarantee
                </span>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
