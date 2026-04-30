import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export default function AdminAnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin analytics"
        title="Marketplace analytics"
        description="Understand vendor growth, buyer activity, and sales performance."
      />
      <PlaceholderPanel
        title="Platform metrics"
        description="Charts and reporting can build from this page."
        items={["Sales trends", "User growth", "Category performance"]}
      />
    </>
  );
}
