import { ScanLine } from "lucide-react";
import { PlaceholderPage } from "../../frontend/shared/components/layout/PlaceholderPage";

export const metadata = { title: "POS — Stockflow" };

export default function Page() {
  return (
    <PlaceholderPage
      title="POS System"
      description="Scan, sell, print receipts — all from one screen."
      icon={ScanLine}
    />
  );
}
