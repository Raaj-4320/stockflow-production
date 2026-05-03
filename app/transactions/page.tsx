import { ArrowLeftRight } from "lucide-react";
import { PlaceholderPage } from "../../frontend/shared/components/layout/PlaceholderPage";

export const metadata = { title: "Transactions — Stockflow" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Transactions"
      description="Every credit and debit, fully reconciled."
      icon={ArrowLeftRight}
    />
  );
}
