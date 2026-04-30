"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { publicShoppingStorage } from "@/lib/public-shopping";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateCartCount = () => setCartCount(publicShoppingStorage.getCartCount());
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("vendorlink-public-cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("vendorlink-public-cart-updated", updateCartCount);
    };
  }, []);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-black/[0.03] bg-[#FAF9F5]/80 backdrop-blur-xl py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link 
            href="/" 
            className="group flex items-center gap-1.5 text-[14px] font-black uppercase tracking-[0.25em] text-[#111]"
          >
            <span>Vendor</span>
            <span className="text-[#C4553A] transition-transform duration-300 group-hover:translate-x-0.5">Link</span>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden items-center gap-8 text-[11px] font-bold tracking-widest uppercase text-[#111]/45 md:flex">
            <Link href="/products" className="relative py-1 transition-colors hover:text-[#111] group">
              Shop
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#C4553A] transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/products" className="relative py-1 transition-colors hover:text-[#111] group">
              Categories
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#C4553A] transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/#features" className="relative py-1 transition-colors hover:text-[#111] group">
              Features
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#C4553A] transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/#vendors" className="relative py-1 transition-colors hover:text-[#111] group">
              Vendors
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#C4553A] transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-4">
            {/* Search Toggle Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#111]/60 transition-colors hover:bg-black/[0.03] hover:text-[#111]"
              aria-label="Search"
            >
              <Search className="h-[17px] w-[17px]" strokeWidth={2} />
            </button>

            {/* User Profile / Login Icon */}
            <Link
              href="/auth/login"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#111]/60 transition-colors hover:bg-black/[0.03] hover:text-[#111]"
              aria-label="Account"
            >
              <User className="h-[17px] w-[17px]" strokeWidth={2} />
            </Link>

            {/* Shopping Bag Icon */}
            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#111]/60 transition-colors hover:bg-black/[0.03] hover:text-[#111]"
              aria-label="Cart"
            >
              <ShoppingBag className="h-[17px] w-[17px]" strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C4553A] px-1 text-[9px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Get Started Button */}
            <Link
              href="/auth/register"
              className="hidden rounded-full bg-[#111] px-5 py-2 text-[11px] font-bold tracking-wider uppercase text-white transition-all duration-300 hover:bg-[#C4553A] md:block"
            >
              Get Started
            </Link>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#111]/60 transition-colors hover:bg-black/[0.03] hover:text-[#111] md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-black/[0.03] bg-[#FAF9F5] md:hidden"
            >
              <div className="flex flex-col gap-1.5 px-6 py-5">
                <Link
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#111]/65 transition-colors hover:bg-black/[0.02] hover:text-[#111]"
                >
                  Shop
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#111]/65 transition-colors hover:bg-black/[0.02] hover:text-[#111]"
                >
                  Categories
                </Link>
                <Link
                  href="/#features"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#111]/65 transition-colors hover:bg-black/[0.02] hover:text-[#111]"
                >
                  Features
                </Link>
                <Link
                  href="/#vendors"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#111]/65 transition-colors hover:bg-black/[0.02] hover:text-[#111]"
                >
                  Vendors
                </Link>
                <hr className="my-3 border-black/[0.03]" />
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#111]/65"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-full bg-[#111] py-3.5 text-center text-[12px] font-bold uppercase tracking-wider text-white"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline Search Overlay Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 top-full border-b border-black/[0.03] bg-[#FAF9F5]/95 px-6 py-4 backdrop-blur-lg"
            >
              <div className="mx-auto flex max-w-2xl items-center gap-3">
                <Search className="h-4 w-4 text-[#111]/40" />
                <input
                  type="text"
                  placeholder="Search products, vendors, categories..."
                  className="w-full bg-transparent text-[14px] font-semibold text-[#111] outline-none placeholder:text-[#111]/30"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-[11px] font-bold uppercase tracking-widest text-[#111]/40 hover:text-[#111]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
