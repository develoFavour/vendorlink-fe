import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export default function SellerSettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Seller settings"
        title="Store settings"
        description="Manage storefront details, business address, payout information, and account preferences."
      />
      <PlaceholderPanel
        title="Store profile"
        description="Vendor profile and operational settings live here."
        items={["Store information", "KYC details", "Notification settings"]}
      />
    </>
  );
}
