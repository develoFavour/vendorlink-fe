"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Store, User } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginSelectionPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full text-[#111]"
    >
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4553A]">
          Choose Access
        </p>
        <h1 className="text-3xl font-[800] tracking-[-0.02em]">Welcome back</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#111]/45">
          Select the account type you want to continue with.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <Link href="/auth/login/buyer" className="w-full">
          <Button
            variant="outline"
            className="h-16 w-full justify-start gap-4 rounded-2xl border-black/[0.06] bg-[#FAFAF8] px-5 text-[#111] transition-all hover:bg-black/[0.02] hover:text-[#111] hover:border-black/20"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#111] border border-black/[0.04]">
              <User className="h-4.5 w-4.5 text-[#111]" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <span className="block text-[13px] font-bold">Log in as a Customer</span>
              <span className="block text-[11px] font-medium text-[#111]/40">Shop local catalogs</span>
            </div>
          </Button>
        </Link>
        
        <Link href="/auth/login/seller" className="w-full">
          <Button
            variant="outline"
            className="h-16 w-full justify-start gap-4 rounded-2xl border-black/[0.06] bg-[#FAFAF8] px-5 text-[#111] transition-all hover:bg-black/[0.02] hover:text-[#111] hover:border-black/20"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#111] border border-black/[0.04]">
              <Store className="h-4.5 w-4.5 text-[#111]" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <span className="block text-[13px] font-bold">Vendor Dashboard</span>
              <span className="block text-[11px] font-medium text-[#111]/40">Manage your business</span>
            </div>
          </Button>
        </Link>

        <Link href="/auth/login/admin" className="w-full">
          <Button
            variant="outline"
            className="h-16 w-full justify-start gap-4 rounded-2xl border-black/[0.06] bg-[#FAFAF8] px-5 text-[#111] transition-all hover:bg-black/[0.02] hover:text-[#111] hover:border-black/20"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#111] border border-black/[0.04]">
              <ShieldCheck className="h-4.5 w-4.5 text-[#111]" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <span className="block text-[13px] font-bold">Admin Console</span>
              <span className="block text-[11px] font-medium text-[#111]/40">Moderate the marketplace</span>
            </div>
          </Button>
        </Link>
      </div>

      <p className="text-[12px] text-[#111]/45">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-bold text-[#111] transition-colors hover:text-[#C4553A]"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}
