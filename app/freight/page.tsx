import { Truck } from "lucide-react";
import { PlaceholderPage } from "../../frontend/shared/components/layout/PlaceholderPage";

export const metadata = { title: "Freight Booking — Stockflow" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Freight Booking"
      description="Book pickups, track shipments, manage couriers."
      icon={Truck}
    />
  );
}
