import { Wallet } from "lucide-react";
import { PlaceholderPage } from "../../frontend/shared/components/layout/PlaceholderPage";

export const metadata = { title: "Finance — Stockflow" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Finance"
      description="Cash flow, expenses, and reconciliation."
      icon={Wallet}
    />
  );
}
