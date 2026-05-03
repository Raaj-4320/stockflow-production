import { BarChart3 } from "lucide-react";
import { PlaceholderPage } from "../../frontend/shared/components/layout/PlaceholderPage";

export const metadata = { title: "Reports — Stockflow" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Reports"
      description="Sales, profitability, and stock-aging analytics."
      icon={BarChart3}
    />
  );
}
