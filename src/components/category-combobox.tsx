'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createCategoryAction } from '@/lib/books/actions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

/**
 * Category picker backed by the DB. Lets the user search the known list and
 * register a brand-new category inline; the new value is persisted via the
 * server action before being selected, so subsequent renders see it too.
 */
export function CategoryCombobox({
  name,
  categories,
  defaultValue = '',
  required,
  id,
}: {
  name: string;
  categories: string[];
  defaultValue?: string;
  required?: boolean;
  id?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [extras, setExtras] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const merged = useMemo(() => {
    const set = new Set<string>([...categories, ...extras]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categories, extras]);

  const trimmed = query.trim();
  const allowCreate =
    trimmed.length > 0 &&
    !merged.some((c) => c.toLowerCase() === trimmed.toLowerCase());

  function pick(next: string) {
    setValue(next);
    setOpen(false);
    setQuery('');
    setError(null);
  }

  function createAndPick() {
    setError(null);
    start(async () => {
      const result = await createCategoryAction(trimmed);
      if (result.error || !result.name) {
        setError(result.error ?? 'Failed to add category');
        return;
      }
      setExtras((prev) =>
        prev.includes(result.name!) ? prev : [...prev, result.name!],
      );
      pick(result.name);
    });
  }

  return (
    <>
      <input type="hidden" name={name} value={value} required={required} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id ?? name}-listbox`}
            data-testid="category-combobox"
            className={cn(
              'lib-input lib-combobox-trigger',
              !value && 'is-empty',
            )}
          >
            <span className="truncate">
              {value || 'Select or create a category…'}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="lib-combobox-pop"
          id={`${id ?? name}-listbox`}
        >
          <Command
            filter={(v, s) =>
              v.toLowerCase().includes(s.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput
              placeholder="Search categories…"
              value={query}
              onValueChange={(v) => {
                setQuery(v);
                setError(null);
              }}
            />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              {allowCreate ? (
                <CommandGroup heading="Add new">
                  <CommandItem
                    value={`__new__:${trimmed}`}
                    onSelect={createAndPick}
                    disabled={pending}
                  >
                    {pending ? 'Adding…' : `+ Create "${trimmed}"`}
                  </CommandItem>
                </CommandGroup>
              ) : null}
              {merged.length > 0 ? (
                <CommandGroup heading="Categories">
                  {merged.map((c) => (
                    <CommandItem key={c} value={c} onSelect={() => pick(c)}>
                      <Check
                        className={cn(
                          'mr-2 h-3.5 w-3.5',
                          value === c ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {c}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
          {error ? (
            <p role="alert" className="lib-field-error px-3 py-2">
              ✕ {error}
            </p>
          ) : null}
        </PopoverContent>
      </Popover>
    </>
  );
}
