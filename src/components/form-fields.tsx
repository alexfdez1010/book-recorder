'use client';

import { Input, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
  placeholder,
  min,
  id,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  id?: string;
}) {
  const fieldId = id ?? name;
  return (
    <div className="lib-field">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        min={min}
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  id,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  id?: string;
}) {
  const fieldId = id ?? name;
  return (
    <div className="lib-field">
      <Label htmlFor={fieldId}>{label}</Label>
      <Select id={fieldId} name={name} defaultValue={defaultValue} required>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
