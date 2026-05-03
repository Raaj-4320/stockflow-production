import { Users } from "lucide-react";
import { PlaceholderPage } from "../../frontend/shared/components/layout/PlaceholderPage";

export const metadata = { title: "Customers — Stockflow" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Customers"
      description="Profiles, balances and lifetime value."
      icon={Users}
    />
  );
}
