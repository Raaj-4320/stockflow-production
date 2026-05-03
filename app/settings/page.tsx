import { Settings } from "lucide-react";
import { PlaceholderPage } from "../../frontend/shared/components/layout/PlaceholderPage";

export const metadata = { title: "Settings — Stockflow" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Company profile, taxes, users and preferences."
      icon={Settings}
    />
  );
}
