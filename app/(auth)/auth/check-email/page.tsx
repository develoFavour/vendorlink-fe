"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CheckEmailPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEmail(new URLSearchParams(window.location.search).get("email"));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full text-center text-[#111]"
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAFAF8] text-[#111] border border-black/[0.04]">
        <MailCheck className="h-8 w-8 text-[#C4553A]" />
      </div>
      
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4553A]">
        Verify Email
      </p>
      
      <h1 className="text-3xl font-[800] tracking-[-0.02em]">Check your inbox</h1>
      
      <p className="mt-3 text-[13px] leading-relaxed text-[#111]/45">
        We sent a verification link{email ? ` to ${email}` : ""}. Open it to activate your VendorLink account before logging in.
      </p>
      
      <Link href="/auth/login" className="mt-8 block">
        <Button className="h-11 w-full rounded-xl bg-[#111] font-bold text-white hover:bg-[#333] transition-colors">
          Go to Login
        </Button>
      </Link>
    </motion.div>
  );
}
