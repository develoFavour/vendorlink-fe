"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full text-[#111]"
    >
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4553A]">
          Account Recovery
        </p>
        <h1 className="text-3xl font-[800] tracking-[-0.02em]">Forgot Password</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#111]/45">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5 pb-2">
            <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">
              Email Address
            </Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              required 
              className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30"
            />
          </div>
          <Button 
            className="h-11 w-full rounded-xl bg-[#111] text-white hover:bg-[#333] font-bold transition-colors" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "Sending link..." : "Send Reset Link"}
          </Button>
        </form>
      ) : (
        <div className="bg-[#C4553A]/10 text-[#C4553A] p-4 rounded-xl text-sm border border-[#C4553A]/20">
          Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-[12px] text-[#111]/45">Remember your password?</p>
        <Link href="/auth/login" className="w-full">
          <Button variant="outline" className="h-11 w-full rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] hover:bg-black/[0.02]">
            Back to Log In
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
