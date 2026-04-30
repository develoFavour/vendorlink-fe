"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { handleApiError } from "@/utils/response";
import { motion } from "framer-motion";
import { publicShoppingStorage, syncPublicShoppingToBuyer } from "@/lib/public-shopping";

export default function BuyerLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextParam, setNextParam] = useState("");

  const getFallbackRedirect = () => {
    if (publicShoppingStorage.getCartCount() > 0) return "/buyer/cart";
    if (publicShoppingStorage.getWishlist().length > 0) return "/buyer/wishlist";
    return "/buyer";
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setNextParam(params.get("next") || "");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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

      if (response.data.user.role === "VENDOR") {
        router.push("/seller");
      } else if (response.data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        try {
          await syncPublicShoppingToBuyer();
        } catch {
          setError("You are signed in, but we could not sync your saved public cart. Please try adding the item again.");
          return;
        }
        router.push(nextParam || getFallbackRedirect());
      }
      router.refresh();
    } catch (err) {
      setError(handleApiError(err));
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
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4553A]">
          Customer Access
        </p>
        <h1 className="text-3xl font-[800] tracking-[-0.02em]">Welcome back</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#111]/45">
          Access your shopper account profile.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="buyer-email" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">
            Email Address
          </Label>
          <Input 
            id="buyer-email" 
            name="email"
            type="email" 
            placeholder="name@example.com" 
            required 
            className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buyer-password" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">
            Password
          </Label>
          <Input 
            id="buyer-password" 
            name="password"
            type="password" 
            placeholder="••••••••••••"
            required 
            className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30"
          />
        </div>
        
        <div className="flex items-center justify-between pt-1 pb-2">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="remember" 
              className="rounded border-black/20 bg-transparent w-4 h-4 text-[#111] focus:ring-black" 
            />
            <Label htmlFor="remember" className="text-[12px] text-[#111]/55 cursor-pointer font-normal">
              Keep me signed in
            </Label>
          </div>
          <Link href="/auth/forgot-password" className="text-[12px] text-[#111]/45 hover:text-[#C4553A] transition-colors">
            Forgot password?
          </Link>
        </div>
        
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <Button 
          className="h-11 w-full rounded-xl bg-[#111] text-white hover:bg-[#333] font-bold transition-colors mt-2" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Log In"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-[12px] text-[#111]/45">Don&apos;t have an account?</p>
        <Link href={`/auth/register/buyer${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`} className="w-full">
          <Button variant="outline" className="h-11 w-full rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] hover:bg-black/[0.02]">
            Create a Buyer Account
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
