import { ProductMarketplace } from "@/components/shop/ProductMarketplace";
import { Heart, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";

export default function BuyerProductsPage() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-[#171714] text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px] lg:p-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-[#F25A1D]" />
              Local picks for you
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Discover products from trusted local vendors.
            </h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-white/55">
              Browse fresh listings, compare prices, save favorites, and preview product details without leaving your buyer dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { label: "Verified vendors", icon: ShieldCheck },
                { label: "Fast local delivery", icon: Truck },
                { label: "Wishlist ready", icon: Heart },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2 text-xs font-black text-white/75">
                    <Icon className="h-4 w-4 text-[#F25A1D]" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex h-full flex-col justify-between gap-8">
              <ShoppingBag className="h-9 w-9 text-[#F25A1D]" />
              <div>
                <p className="text-3xl font-black">Shop smarter</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/55">
                  Your selected product appears in the quick-look panel, and the full detail page is tailored for logged-in buyers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductMarketplace mode="buyer" />
    </div>
  );
}
