import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-black/[0.04] bg-white px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-[13px] font-[900] uppercase tracking-[0.22em] text-[#111]"
            >
              VendorLink
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-[1.6] text-[#111]/40">
              A community marketplace bringing local merchants directly to your
              screen. Shop locally, support community.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/40">
                Explore
              </p>
              <div className="flex flex-col gap-3 text-[13px] text-[#111]/60">
                <Link href="#shop" className="transition-colors hover:text-[#111]">
                  Shop
                </Link>
                <Link href="#categories" className="transition-colors hover:text-[#111]">
                  Categories
                </Link>
                <Link href="#features" className="transition-colors hover:text-[#111]">
                  Features
                </Link>
                <Link href="/auth/register/seller" className="transition-colors hover:text-[#111]">
                  Become a Vendor
                </Link>
              </div>
            </div>
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/40">
                Legal
              </p>
              <div className="flex flex-col gap-3 text-[13px] text-[#111]/60">
                <Link href="#" className="transition-colors hover:text-[#111]">
                  Terms of Service
                </Link>
                <Link href="#" className="transition-colors hover:text-[#111]">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Subscribe */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/40">
              Stay in Touch
            </p>
            <p className="mb-4 text-[13px] text-[#111]/40">
              Get notified of new neighborhood vendor launches.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="h-10 flex-1 rounded-xl border border-black/[0.08] bg-[#FAFAF8] px-4 text-[13px] text-[#111] placeholder:text-[#111]/30 focus:border-black/30 focus:outline-none"
              />
              <button className="rounded-xl bg-[#111] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#333]">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-black/[0.04] pt-8 sm:flex-row">
          <p className="text-[11px] text-[#111]/30">
            © {new Date().getFullYear()} VendorLink. All rights reserved.
          </p>
          <p className="text-[11px] text-[#111]/30">
            Based in Lagos, Nigeria 🇳🇬
          </p>
        </div>
      </div>
    </footer>
  );
};
