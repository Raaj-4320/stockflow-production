"use client";

import { useState } from "react";
import type { Party } from "../types";
import { PurchasePartyForm } from "./PurchasePartyForm";
import { PurchasePartyList } from "./PurchasePartyList";
import { Card, CardHeader } from "../../../../shared/components/ui/Card";
import { Modal } from "../../../../shared/components/ui/Modal";

interface PurchasePartySectionProps {
  parties: Party[];
  isLoading: boolean;
  onAddParty: (party: Party) => void;
  onUpdateParty: (party: Party) => void;
  onDeleteParty: (partyId: string) => void;
}

export function PurchasePartySection({
  parties,
  isLoading,
  onAddParty,
  onUpdateParty,
  onDeleteParty,
}: PurchasePartySectionProps) {
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  const handleEdit = (party: Party) => {
    setEditingParty(party);
  };

  const handleUpdate = (updated: Party) => {
    onUpdateParty(updated);
    setEditingParty(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Create form — left column */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <PurchasePartyForm onSubmit={onAddParty} />
          </Card>
        </div>

        {/* Party list — right column */}
        <div className="lg:col-span-3">
          <Card padding="none">
            <CardHeader
              title={`Saved Parties (${parties.length})`}
              subtitle="Click a party to expand details"
              className="px-5 pt-5 mb-0"
            />
            <div className="px-5 pb-5 pt-3">
              <PurchasePartyList
                parties={parties}
                onEdit={handleEdit}
                onDelete={onDeleteParty}
                isLoading={isLoading}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        open={editingParty !== null}
        onClose={() => setEditingParty(null)}
        title="Edit Party"
        size="md"
      >
        {editingParty && (
          <PurchasePartyForm
            initialValues={{
              name: editingParty.name,
              phone: editingParty.phone ?? "",
              email: editingParty.email ?? "",
              gst: editingParty.gst ?? "",
              contactPerson: editingParty.contactPerson ?? "",
              address: editingParty.address ?? "",
            }}
            editingId={editingParty.id}
            onSubmit={handleUpdate}
            onCancel={() => setEditingParty(null)}
          />
        )}
      </Modal>
    </>
  );
}
