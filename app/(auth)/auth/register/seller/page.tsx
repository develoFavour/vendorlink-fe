"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Store, User, CreditCard } from "lucide-react";
import { authService } from "@/services/auth.service";
import { handleApiError } from "@/utils/response";

export default function VendorRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    storeName: "",
    category: "",
    address: "",
    bankName: "",
    accountNumber: "",
    cacNumber: "",
  });

  const updateField = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep(s => s + 1);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.registerVendor(formData);
      setIsLoading(false);
      router.push(`/auth/check-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(handleApiError(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full text-[#111]">
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4553A]">
          Vendor Onboarding
        </p>
        <h1 className="text-3xl font-[800] tracking-[-0.02em]">Create your store</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#111]/45">
          Set up your digital storefront profile.
        </p>
      </div>

      {step < 4 && (
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-[#C4553A]' : 'bg-black/[0.06]'}`} />
            </div>
          ))}
        </div>
      )}

      <div className="relative overflow-hidden min-h-[320px]">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={nextStep}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-[#111]/70 font-bold uppercase tracking-wider text-[11px] mb-4">
                <User className="w-4 h-4 text-[#C4553A]" strokeWidth={2} /> Account Details
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">Full Name</Label>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={updateField} placeholder="Jane Doe" required className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">Email Address</Label>
                <Input id="email" name="email" value={formData.email} onChange={updateField} type="email" placeholder="jane@example.com" required className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">Phone Number</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={updateField} type="tel" placeholder="+234 800 000 0000" required className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30" />
              </div>
              <div className="space-y-1.5 pb-2">
                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">Password</Label>
                <Input id="password" name="password" value={formData.password} onChange={updateField} type="password" required className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30" />
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl bg-[#111] text-white hover:bg-[#333] font-bold transition-colors group">
                Next <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={nextStep}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-[#111]/70 font-bold uppercase tracking-wider text-[11px] mb-4">
                <Store className="w-4 h-4 text-[#C4553A]" strokeWidth={2} /> Store & Logistics
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storeName" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">Store Name</Label>
                <Input id="storeName" name="storeName" value={formData.storeName} onChange={updateField} placeholder="My Awesome Store" required className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">Primary Category</Label>
                <select id="category" name="category" value={formData.category} onChange={updateField} required className="flex h-11 w-full items-center justify-between rounded-xl border border-black/[0.08] bg-[#FAFAF8] px-3 py-2 text-sm text-[#111] focus:outline-none focus:ring-1 focus:ring-black/30">
                  <option value="" className="text-gray-900">Select a category</option>
                  <option value="fashion" className="text-gray-900">Fashion & Apparel</option>
                  <option value="electronics" className="text-gray-900">Electronics</option>
                  <option value="groceries" className="text-gray-900">Groceries & Food</option>
                  <option value="other" className="text-gray-900">Other</option>
                </select>
              </div>
              <div className="space-y-1.5 pb-2">
                <Label htmlFor="address" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">Physical Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={updateField} placeholder="123 Market Street, City" required className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30" />
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={() => setStep(1)} className="h-11 flex-1 rounded-xl border border-black/[0.08] bg-[#FAFAF8] text-[#111] hover:bg-black/[0.02]">Back</Button>
                <Button type="submit" className="h-11 flex-1 rounded-xl bg-[#111] text-white hover:bg-[#333] font-bold">Next</Button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form 
              key="step3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={submitForm}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-[#111]/70 font-bold uppercase tracking-wider text-[11px] mb-4">
                <CreditCard className="w-4 h-4 text-[#C4553A]" strokeWidth={2} /> Payouts & Verification
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">Bank Name</Label>
                <Input id="bank" name="bankName" value={formData.bankName} onChange={updateField} placeholder="e.g. GTBank" required className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accountNum" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">Account Number</Label>
                <Input id="accountNum" name="accountNumber" value={formData.accountNumber} onChange={updateField} placeholder="0123456789" required className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30" />
              </div>
              <div className="space-y-1.5 pb-2">
                <Label htmlFor="cac" className="text-[11px] font-bold uppercase tracking-wider text-[#111]/60">CAC Registration (Optional)</Label>
                <Input id="cac" name="cacNumber" value={formData.cacNumber} onChange={updateField} placeholder="RC-123456" className="h-11 rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] placeholder:text-[#111]/25 focus-visible:ring-black/20 focus-visible:border-black/30" />
              </div>
              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
              <div className="flex gap-3">
                <Button type="button" onClick={() => setStep(2)} disabled={isLoading} className="h-11 flex-1 rounded-xl border border-black/[0.08] bg-[#FAFAF8] text-[#111] hover:bg-black/[0.02]">Back</Button>
                <Button type="submit" disabled={isLoading} className="h-11 flex-1 rounded-xl bg-[#111] text-white hover:bg-[#333] font-bold">
                  {isLoading ? "Submitting..." : "Complete"}
                </Button>
              </div>
            </motion.form>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle2 className="w-16 h-16 text-[#C4553A] mx-auto mb-4" />
              <h2 className="text-2xl font-[800] text-[#111] mb-2">Check your email</h2>
              <p className="text-[#111]/45 mb-8 text-[13px] leading-relaxed">We sent a verification link. Please check your inbox and verify your email before logging in.</p>
              <Button onClick={() => router.push("/auth/login/seller")} className="h-11 w-full rounded-xl bg-[#111] text-white hover:bg-[#333] font-bold">Log In</Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
      {step < 4 && (
        <div className="mt-6 pt-6 flex flex-col items-center gap-3 border-t border-black/[0.04]">
          <p className="text-[12px] text-[#111]/45">Already have an account?</p>
          <Link href="/auth/login/seller" className="w-full">
            <Button variant="outline" className="h-11 w-full rounded-xl border-black/[0.08] bg-[#FAFAF8] text-[#111] hover:bg-black/[0.02]">
              Log In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
