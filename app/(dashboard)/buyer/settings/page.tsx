import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export default function BuyerSettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Buyer settings"
        title="Account settings"
        description="Manage customer profile, delivery addresses, and notification preferences."
      />
      <PlaceholderPanel
        title="Preferences"
        description="Buyer profile settings live here."
        items={["Profile", "Addresses", "Notifications"]}
      />
    </>
  );
}
