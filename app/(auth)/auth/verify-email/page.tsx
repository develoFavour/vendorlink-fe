"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { handleApiError } from "@/utils/response";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      const verificationToken = new URLSearchParams(window.location.search).get("token");

      if (!verificationToken) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        await authService.verifyEmail(verificationToken);
        setStatus("success");
        setMessage("Your email has been verified. You can now log in.");
      } catch (err) {
        setStatus("error");
        setMessage(handleApiError(err));
      }
    };

    void verifyEmail();
  }, []);

  const Icon = status === "success" ? CheckCircle2 : status === "error" ? XCircle : Loader2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full text-center text-[#111]"
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAFAF8] text-[#111] border border-black/[0.04]">
        <Icon className={`h-8 w-8 text-[#C4553A] ${status === "loading" ? "animate-spin" : ""}`} />
      </div>
      
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4553A]">
        Account Verification
      </p>
      
      <h1 className="text-3xl font-[800] tracking-[-0.02em]">
        {status === "success" ? "Email Verified" : status === "error" ? "Verification Failed" : "Verifying"}
      </h1>
      
      <p className="mt-3 text-[13px] leading-relaxed text-[#111]/45">
        {message}
      </p>
      
      <Link href="/auth/login" className="mt-8 block">
        <Button className="h-11 w-full rounded-xl bg-[#111] font-bold text-white hover:bg-[#333] transition-colors">
          Log In
        </Button>
      </Link>
    </motion.div>
  );
}
