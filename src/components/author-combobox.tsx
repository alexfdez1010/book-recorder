'use client';

import { useMemo, useState } from 'react';
import type { Key } from '@heroui/react';
import { ComboBox, Input, ListBox } from '@heroui/react';

const CUSTOM_AUTHOR_KEY = '__custom_author__';

export interface AuthorComboboxProps {
  authors: string[];
  defaultValue?: string;
  id?: string;
  name: string;
  required?: boolean;
}

/**
 * Selects a known author or accepts a new author name. The selected text is
 * submitted through a hidden field because author names are the domain value.
 */
export function AuthorCombobox({
  authors,
  defaultValue = '',
  id,
  name,
  required,
}: AuthorComboboxProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [value, setValue] = useState(defaultValue);
  const options = useMemo(
    () => [...new Set(authors)].sort((a, b) => a.localeCompare(b)),
    [authors],
  );
  const trimmed = inputValue.trim();
  const allowCustom =
    trimmed.length > 0 &&
    !options.some(
      (author) => author.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
    );

  /** Commits a list item or the current custom author text. */
  function selectAuthor(key: Key | null): void {
    if (key === null) return;
    const next = key === CUSTOM_AUTHOR_KEY ? trimmed : String(key);
    setValue(next);
    setInputValue(next);
  }

  return (
    <>
      <input type="hidden" name={name} value={value} required={required} />
      <ComboBox
        allowsCustomValue
        aria-label="Author"
        className="lib-combobox"
        inputValue={inputValue}
        isRequired={required}
        menuTrigger="focus"
        onInputChange={(next) => {
          setInputValue(next);
          setValue(next.trim());
        }}
        onSelectionChange={selectAuthor}
        selectedKey={options.includes(value) ? value : null}
      >
        <ComboBox.InputGroup className="lib-combobox__group">
          <Input
            id={id}
            className="lib-input lib-combobox__input"
            placeholder="Select or type an author…"
            required={required}
          />
          <ComboBox.Trigger
            aria-label="Show authors"
            className="lib-combobox__trigger"
          />
        </ComboBox.InputGroup>
        <ComboBox.Popover
          className="lib-combobox__popover"
          placement="bottom start"
        >
          <ListBox className="lib-combobox__list">
            {allowCustom ? (
              <ListBox.Item id={CUSTOM_AUTHOR_KEY} textValue={`Use ${trimmed}`}>
                Use “{trimmed}”
              </ListBox.Item>
            ) : null}
            {options.map((author) => (
              <ListBox.Item key={author} id={author} textValue={author}>
                {author}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
    </>
  );
}
