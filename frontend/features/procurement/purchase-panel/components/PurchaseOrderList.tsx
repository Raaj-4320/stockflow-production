"use client";

import { ShoppingCart } from "lucide-react";
import type { PurchaseOrder } from "../types";
import { PurchaseOrderCard } from "./PurchaseOrderCard";
import { SkeletonList } from "../../../../shared/components/ui/Skeleton";
import { Button } from "../../../../shared/components/ui/Button";

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onEdit: (order: PurchaseOrder) => void;
  onReceive: (order: PurchaseOrder) => void;
  onDelete?: (order: PurchaseOrder) => void;
  onCreateOrder: () => void;
}

export function PurchaseOrderList({
  orders,
  isLoading,
  onEdit,
  onReceive,
  onDelete,
  onCreateOrder,
}: PurchaseOrderListProps) {
  if (isLoading) {
    return <SkeletonList count={4} />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-bg-primary flex items-center justify-center border-2 border-dashed border-border-default">
          <ShoppingCart size={24} className="text-text-muted" />
        </div>
        <div>
          <p className="text-base font-medium text-text-primary">No orders found</p>
          <p className="text-sm text-text-muted mt-1">
            Try changing your filters or create a new order.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={onCreateOrder}>
          Create First Order
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {orders.map((order) => (
        <PurchaseOrderCard
          key={order.id}
          order={order}
          onEdit={onEdit}
          onReceive={onReceive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
