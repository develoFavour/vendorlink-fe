import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export default function AdminMessagesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin messages"
        title="Support inbox"
        description="Monitor marketplace communication and support escalation."
      />
      <PlaceholderPanel
        title="Support queue"
        description="Admin messaging tools live here."
        items={["Open tickets", "Vendor escalations", "Buyer disputes"]}
      />
    </>
  );
}
