"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";
import type { Category } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

export function AdminCategoryManagerModal({
  open,
  onClose,
  categories,
  onAdd,
  onRename,
  onDelete,
}: Props) {
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ name: string; value: string } | null>(
    null
  );
  const [confirmDelete, setConfirmDelete] = useState<{
    name: string;
    typed: string;
  } | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName);
    setNewName("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Categories"
      subtitle="Add, rename, or remove product categories. Esc to close."
      size="md"
    >
      {/* Add new */}
      <div className="flex items-end gap-2 mb-4">
        <Input
          label="New category"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1"
        />
        <Button leftIcon={<Plus size={13} />} onClick={handleAdd}>
          Add
        </Button>
      </div>

      <ul className="space-y-1.5 max-h-[360px] overflow-y-auto">
        {categories.map((c) => {
          const isEditing = editing?.name === c.name;
          const isDeleting = confirmDelete?.name === c.name;
          return (
            <li
              key={c.id}
              className="flex items-center gap-2 p-2 rounded-md bg-surface"
            >
              {isEditing ? (
                <>
                  <Input
                    autoFocus
                    value={editing.value}
                    onChange={(e) =>
                      setEditing({ ...editing, value: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editing.value.trim()) {
                        onRename(editing.name, editing.value.trim());
                        setEditing(null);
                      }
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(null)}
                    leftIcon={<X size={13} />}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (editing.value.trim()) {
                        onRename(editing.name, editing.value.trim());
                        setEditing(null);
                      }
                    }}
                    leftIcon={<Check size={13} />}
                  >
                    Save
                  </Button>
                </>
              ) : isDeleting ? (
                <>
                  <div className="flex-1 text-sm">
                    Type{" "}
                    <span className="font-semibold text-[var(--negative)]">
                      {c.name}
                    </span>{" "}
                    to confirm:
                  </div>
                  <Input
                    autoFocus
                    value={confirmDelete.typed}
                    onChange={(e) =>
                      setConfirmDelete({
                        ...confirmDelete,
                        typed: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setConfirmDelete(null);
                      if (
                        e.key === "Enter" &&
                        confirmDelete.typed === c.name
                      ) {
                        onDelete(c.name);
                        setConfirmDelete(null);
                      }
                    }}
                    className="w-44"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={confirmDelete.typed !== c.name}
                    onClick={() => {
                      onDelete(c.name);
                      setConfirmDelete(null);
                    }}
                    className="!bg-[var(--negative)] !text-white"
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted">
                      {c.productCount} products
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setEditing({ name: c.name, value: c.name })
                    }
                    className="p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover"
                    title="Rename"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() =>
                      setConfirmDelete({ name: c.name, typed: "" })
                    }
                    className="p-1.5 rounded-sm text-muted hover:text-[var(--negative)] hover:bg-[var(--negative-bg)]"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
