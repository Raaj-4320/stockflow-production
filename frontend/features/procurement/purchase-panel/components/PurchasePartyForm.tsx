"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import type { Party, PartyFormValues } from "../types";
import { Button } from "../../../../shared/components/ui/Button";
import { Input, Textarea } from "../../../../shared/components/ui/Input";

const EMPTY_FORM: PartyFormValues = {
  name: "",
  phone: "",
  email: "",
  gst: "",
  contactPerson: "",
  address: "",
};

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
  gst?: string;
}

function validate(values: PartyFormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Party name is required";
  if (values.phone && !/^[+\d\s\-()]{7,15}$/.test(values.phone)) {
    errors.phone = "Enter a valid phone number";
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address";
  }
  if (values.gst && !/^[0-9A-Z]{15}$/.test(values.gst.toUpperCase())) {
    errors.gst = "GST must be 15 alphanumeric characters";
  }
  return errors;
}

interface PurchasePartyFormProps {
  onSubmit: (party: Party) => void;
  initialValues?: Partial<PartyFormValues>;
  editingId?: string;
  onCancel?: () => void;
}

export function PurchasePartyForm({
  onSubmit,
  initialValues,
  editingId,
  onCancel,
}: PurchasePartyFormProps) {
  const [values, setValues] = useState<PartyFormValues>({
    ...EMPTY_FORM,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: keyof PartyFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    setValues((prev) => ({ ...prev, [field]: val }));
    if (touched.has(field)) {
      setErrors(validate({ ...values, [field]: val }));
    }
  };

  const blur = (field: string) => () => {
    setTouched((prev) => new Set(prev).add(field));
    setErrors(validate(values));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = new Set(Object.keys(EMPTY_FORM));
    setTouched(allTouched);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 300)); // Mock save delay

    const party: Party = {
      id: editingId ?? `party-${Date.now()}`,
      name: values.name.trim(),
      phone: values.phone.trim() || undefined,
      email: values.email.trim() || undefined,
      gst: values.gst.trim().toUpperCase() || undefined,
      contactPerson: values.contactPerson.trim() || undefined,
      address: values.address.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSubmit(party);
    setIsSubmitting(false);
    if (!editingId) {
      setValues(EMPTY_FORM);
      setTouched(new Set());
      setErrors({});
    }
  };

  const isEditing = !!editingId;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Building2 size={15} className="text-accent" />
        <h3 className="text-sm font-semibold text-text-primary">
          {isEditing ? "Edit Party" : "Add New Party"}
        </h3>
      </div>

      <Input
        label="Party Name"
        required
        placeholder="e.g. Alpha Textiles Pvt Ltd"
        value={values.name}
        onChange={set("name")}
        onBlur={blur("name")}
        error={touched.has("name") ? errors.name : undefined}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={values.phone}
          onChange={set("phone")}
          onBlur={blur("phone")}
          error={touched.has("phone") ? errors.phone : undefined}
        />
        <Input
          label="Email"
          type="email"
          placeholder="contact@supplier.com"
          value={values.email}
          onChange={set("email")}
          onBlur={blur("email")}
          error={touched.has("email") ? errors.email : undefined}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="GST Number"
          placeholder="27AABCA1234A1Z5"
          value={values.gst}
          onChange={set("gst")}
          onBlur={blur("gst")}
          error={touched.has("gst") ? errors.gst : undefined}
          hint="15-character GSTIN"
        />
        <Input
          label="Contact Person"
          placeholder="e.g. Ramesh Kapoor"
          value={values.contactPerson}
          onChange={set("contactPerson")}
        />
      </div>

      <Textarea
        label="Address"
        placeholder="Street, City, Pincode"
        value={values.address}
        onChange={set("address")}
        rows={2}
      />

      <div className="flex items-center gap-2 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          fullWidth={!onCancel}
        >
          {isEditing ? "Save Changes" : "Add Party"}
        </Button>
      </div>
    </form>
  );
}
