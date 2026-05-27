"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { handleApiError } from "@/utils/response";
import { toast } from "sonner";
import { setFrontendAuthSession } from "@/lib/auth-session";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await authService.login({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      });

      if (response.data.user.role !== "ADMIN") {
        const message = "This login is only for administrator accounts.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(response.message || "Logged in successfully.");
      setFrontendAuthSession(response.data.user.role, response.data.token, response.data.refreshToken);

      const searchParams = new URLSearchParams(window.location.search);
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full text-[#111]"
    >
      <div className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFEDE5] text-[#C4553A]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4553A]">
          Admin Access
        </p>
        <h1 className="text-3xl font-[800] tracking-[-0.02em]">Control console</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#111]/45">
          Sign in to moderate vendors, products, orders, refunds, and platform operations.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="admin-email" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">
            Admin Email
          </Label>
          <Input
            id="admin-email"
            name="email"
            type="email"
            placeholder="admin@vendorlink.com"
            required
            className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-password" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">
            Password
          </Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            placeholder="Password"
            required
            className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30"
          />
        </div>

        {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : null}

        <Button
          className="h-11 w-full rounded-xl bg-[#111] text-white hover:bg-[#333] font-bold transition-colors mt-2"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Log in to Admin"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[12px] text-[#111]/45">
        Not an admin?{" "}
        <Link href="/auth/login" className="font-bold text-[#111] transition-colors hover:text-[#C4553A]">
          Choose another login
        </Link>
      </p>
    </motion.div>
  );
}
