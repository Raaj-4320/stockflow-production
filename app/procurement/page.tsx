import { ShoppingBag } from "lucide-react";
import { PlaceholderPage } from "../../frontend/shared/components/layout/PlaceholderPage";

export const metadata = { title: "New Purchase — Stockflow" };

export default function Page() {
  return (
    <PlaceholderPage
      title="New Purchase"
      description="Create purchase orders, manage parties, and receive stock."
      icon={ShoppingBag}
    />
  );
}
