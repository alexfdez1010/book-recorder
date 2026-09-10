'use client';

import { ListBox, Select } from '@heroui/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Renders a labelled form input; native constraints validate submitted values. */
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

/** Renders a labelled required choice with its initial value and supplied options. */
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
  return (
    <Select
      className="lib-field"
      defaultSelectedKey={defaultValue}
      id={id}
      isRequired
      name={name}
    >
      <Label>{label}</Label>
      <Select.Trigger className="lib-select">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="lib-select__popover">
        <ListBox className="lib-select__list">
          {options.map((option) => (
            <ListBox.Item
              key={option.value}
              id={option.value}
              textValue={option.label}
            >
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
