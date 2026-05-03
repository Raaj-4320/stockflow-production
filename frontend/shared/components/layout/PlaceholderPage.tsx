import { PageHeader } from "./PageHeader";
import { Card } from "../ui/Card";

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
      <PageHeader title={title} description={description} />
      <Card padding="lg" className="min-h-[420px] grid place-items-center">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-surface-active mx-auto grid place-items-center mb-4">
            <Icon size={20} className="text-secondary" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            {title} coming soon
          </h2>
          <p className="text-sm text-secondary mt-1.5">
            This module is under construction. The shell, theme tokens, and
            keyboard shortcuts already work — drop your feature components in
            here.
          </p>
        </div>
      </Card>
    </div>
  );
}
