'use client';

import { useMemo, useState, useTransition } from 'react';
import type { Key } from '@heroui/react';
import { ComboBox, Input, ListBox } from '@heroui/react';
import { createCategoryAction } from '@/lib/books/actions';

const CREATE_CATEGORY_KEY = '__create_category__';

export interface CategoryComboboxProps {
  categories: string[];
  defaultValue?: string;
  id?: string;
  name: string;
  required?: boolean;
}

/** Selects a persisted category and creates missing categories inline. */
export function CategoryCombobox({
  categories,
  defaultValue = '',
  id,
  name,
  required,
}: CategoryComboboxProps) {
  const [error, setError] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [value, setValue] = useState(defaultValue);
  const [pending, startTransition] = useTransition();
  const options = useMemo(
    () =>
      [...new Set([...categories, ...extras])].sort((a, b) =>
        a.localeCompare(b),
      ),
    [categories, extras],
  );
  const trimmed = inputValue.trim();
  const allowCreate =
    trimmed.length > 0 &&
    !options.some(
      (category) =>
        category.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
    );

  /** Commits a known category or starts persistence for the custom option. */
  function selectCategory(key: Key | null): void {
    if (key === null) return;
    if (key === CREATE_CATEGORY_KEY) {
      createCategory(trimmed);
      return;
    }
    const next = String(key);
    setValue(next);
    setInputValue(next);
    setError(null);
  }

  /** Persists a category before exposing it as the selected form value. */
  function createCategory(category: string): void {
    setError(null);
    startTransition(async () => {
      const result = await createCategoryAction(category);
      if (result.error || !result.name) {
        setError(result.error ?? 'Failed to add category');
        return;
      }
      setExtras((current) =>
        current.includes(result.name!) ? current : [...current, result.name!],
      );
      setValue(result.name);
      setInputValue(result.name);
    });
  }

  return (
    <>
      <input type="hidden" name={name} value={value} required={required} />
      <ComboBox
        aria-label="Category"
        className="lib-combobox"
        inputValue={inputValue}
        isDisabled={pending}
        isRequired={required}
        menuTrigger="focus"
        onInputChange={(next) => {
          setInputValue(next);
          setValue('');
          setError(null);
        }}
        onSelectionChange={selectCategory}
        selectedKey={value || null}
      >
        <ComboBox.InputGroup className="lib-combobox__group">
          <Input
            id={id}
            className="lib-input lib-combobox__input"
            placeholder="Search categories…"
            required={required}
          />
          <ComboBox.Trigger
            aria-label="Show categories"
            className="lib-combobox__trigger"
          />
        </ComboBox.InputGroup>
        <ComboBox.Popover
          className="lib-combobox__popover"
          placement="bottom start"
        >
          <ListBox className="lib-combobox__list">
            {allowCreate ? (
              <ListBox.Item
                id={CREATE_CATEGORY_KEY}
                textValue={`Create ${trimmed}`}
              >
                {pending ? 'Adding…' : `Create "${trimmed}"`}
              </ListBox.Item>
            ) : null}
            {options.map((category) => (
              <ListBox.Item key={category} id={category} textValue={category}>
                {category}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
      {error ? (
        <p role="alert" className="lib-field-error">
          {error}
        </p>
      ) : null}
    </>
  );
}
