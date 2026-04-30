"use client";

import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PublicAuthPromptProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "cart" | "wishlist" | "checkout";
  nextPath?: string;
};

const copy = {
  cart: {
    icon: ShoppingBag,
    title: "Cart saved",
    description: "Sign in or create a buyer account and we will move this item into your real cart.",
    next: "/buyer/cart",
  },
  wishlist: {
    icon: Heart,
    title: "Wishlist saved",
    description: "Create or access your buyer account so your saved products follow you across devices.",
    next: "/buyer/wishlist",
  },
  checkout: {
    icon: UserRound,
    title: "Ready to checkout?",
    description: "Sign in or create a buyer account and we will sync your public cart before checkout.",
    next: "/buyer/checkout",
  },
};

export function PublicAuthPrompt({
  open,
  onOpenChange,
  action,
  nextPath,
}: PublicAuthPromptProps) {
  const active = copy[action];
  const Icon = active.icon;
  const encodedNext = encodeURIComponent(nextPath || active.next);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[28px] bg-white p-6 sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFEDE5] text-[#C4553A]">
            <Icon className="h-5 w-5" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-[#111]">
            {active.title}
          </DialogTitle>
          <DialogDescription className="text-sm font-semibold leading-6 text-[#74746F]">
            {active.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-3">
          <Link
            href={`/auth/login/buyer?next=${encodedNext}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#111] px-5 text-sm font-black text-white"
          >
            Sign in as buyer
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/auth/register/buyer?next=${encodedNext}`}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#FAFAF8] px-5 text-sm font-black text-[#111]"
          >
            Create buyer account
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
