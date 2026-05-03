"use client";

import { useState } from "react";
import { Building2, Phone, Mail, MapPin, Edit2, Trash2, Users } from "lucide-react";
import { clsx } from "clsx";
import type { Party } from "../types";
import { ConfirmDialog } from "../../../../shared/components/ui/Modal";

interface PurchasePartyListProps {
  parties: Party[];
  onEdit: (party: Party) => void;
  onDelete: (partyId: string) => void;
  isLoading?: boolean;
}

export function PurchasePartyList({
  parties,
  onEdit,
  onDelete,
  isLoading,
}: PurchasePartyListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-border-subtle animate-[skeletonPulse_1.5s_ease-in-out_infinite]"
          />
        ))}
      </div>
    );
  }

  if (parties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-bg-primary border-2 border-dashed border-border-default flex items-center justify-center">
          <Users size={20} className="text-text-muted" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">No parties yet</p>
          <p className="text-xs text-text-muted mt-0.5">
            Add your first supplier using the form.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {parties.map((party) => (
          <PartyCard
            key={party.id}
            party={party}
            onEdit={() => onEdit(party)}
            onDelete={() => setDeleteTarget(party)}
          />
        ))}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Party"
        description={
          <span>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>? This action cannot be
            undone.
          </span>
        }
        confirmLabel="Delete"
      />
    </>
  );
}

interface PartyCardProps {
  party: Party;
  onEdit: () => void;
  onDelete: () => void;
}

function PartyCard({ party, onEdit, onDelete }: PartyCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group bg-bg-surface border border-border-subtle rounded-lg overflow-hidden hover:border-border-default transition-colors">
      {/* Summary row — use div to avoid nested button violation */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-hover transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center shrink-0 text-accent font-semibold text-sm">
          {party.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{party.name}</p>
          {party.contactPerson && (
            <p className="text-xs text-text-muted truncate">{party.contactPerson}</p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-primary transition-colors"
            aria-label={`Edit ${party.name}`}
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger-bg transition-colors"
            aria-label={`Delete ${party.name}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-4 pb-3 pt-0 grid grid-cols-1 gap-1.5 border-t border-border-subtle bg-bg-primary/50"
          style={{ animation: "slideDown 120ms ease-out" }}
        >
          {party.phone && (
            <DetailRow icon={<Phone size={11} />} value={party.phone} />
          )}
          {party.email && (
            <DetailRow icon={<Mail size={11} />} value={party.email} />
          )}
          {party.address && (
            <DetailRow icon={<MapPin size={11} />} value={party.address} />
          )}
          {party.gst && (
            <DetailRow
              icon={<Building2 size={11} />}
              value={`GST: ${party.gst}`}
              mono
            />
          )}
          {!party.phone && !party.email && !party.address && !party.gst && (
            <p className="text-xs text-text-muted py-1">No additional details</p>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  value,
  mono,
}: {
  icon: React.ReactNode;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-xs text-text-secondary pt-1.5">
      <span className="text-text-muted mt-0.5 shrink-0">{icon}</span>
      <span className={clsx("break-all", mono && "font-mono")}>{value}</span>
    </div>
  );
}
