import { LayoutDashboard } from "lucide-react";
import { PlaceholderPage } from "../../frontend/shared/components/layout/PlaceholderPage";

export const metadata = { title: "Dashboard — Stockflow" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Your business at a glance — sales, inventory, and cash."
      icon={LayoutDashboard}
    />
  );
}
