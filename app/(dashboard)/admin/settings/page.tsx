import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin settings"
        title="Platform settings"
        description="Configure marketplace rules, admin preferences, and operational settings."
      />
      <PlaceholderPanel
        title="Configuration"
        description="Admin configuration lives here."
        items={["Marketplace rules", "Admin profile", "Security"]}
      />
    </>
  );
}
