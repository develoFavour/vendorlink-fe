import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] p-4 font-sans text-[#111] lg:p-6">
      <div className="relative flex min-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-black/[0.03] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.01)] lg:min-h-[calc(100vh-3rem)]">
        
        {/* Navigation / Logo Header */}
        <div className="absolute inset-x-8 top-8 z-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-[13px] font-[900] uppercase tracking-[0.22em] text-[#111]">
              VendorLink
            </span>
          </Link>
          <Link
            href="/"
            className="hidden rounded-full border border-black/[0.06] bg-[#FAFAF8] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#111]/50 shadow-sm transition-all hover:bg-black/[0.02] hover:text-[#111] sm:block"
          >
            Back home
          </Link>
        </div>

        {/* Left branding panel (Desktop only) */}
        <div className="hidden flex-1 flex-col justify-end bg-[#FAFAF8] p-12 lg:flex">
          <div className="relative mb-8 min-h-[480px] overflow-hidden rounded-2xl border border-black/[0.02] bg-white p-10 shadow-[0_8px_24px_rgba(0,0,0,0.01)]">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[#C4553A]/5" />
            
            <div className="absolute bottom-10 left-10 right-10">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4553A]">
                The Local Ecosystem
              </p>
              <h1 className="max-w-md text-3xl font-[800] tracking-[-0.02em] text-[#111] sm:text-4xl">
                Sell beyond your street, serve your community.
              </h1>
              <p className="mt-4 max-w-sm text-[13px] leading-[1.6] text-[#111]/45">
                Connecting local merchants, campus sellers, and neighborhood creators
                directly to buyers in their immediate area.
              </p>
              
              <div className="mt-8 grid grid-cols-3 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#111]/40">
                <div className="rounded-xl bg-[#FAFAF8] p-3 text-center border border-black/[0.02]">Storefronts</div>
                <div className="rounded-xl bg-[#FAFAF8] p-3 text-center border border-black/[0.02]">Orders</div>
                <div className="rounded-xl bg-[#FAFAF8] p-3 text-center border border-black/[0.02]">Payments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right content panel (Auth forms) */}
        <div className="flex w-full items-center justify-center px-6 py-28 lg:w-[480px] lg:px-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
