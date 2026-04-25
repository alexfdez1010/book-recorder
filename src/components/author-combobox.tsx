'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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

export function AuthorCombobox({
  name,
  authors,
  defaultValue = '',
  required,
  id,
}: {
  name: string;
  authors: string[];
  defaultValue?: string;
  required?: boolean;
  id?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const allowCreate =
    query.trim().length > 0 &&
    !authors.some((a) => a.toLowerCase() === query.trim().toLowerCase());

  const options = useMemo(() => authors.slice().sort(), [authors]);

  function pick(next: string) {
    setValue(next);
    setOpen(false);
    setQuery('');
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
            data-testid="author-combobox"
            className={cn('lib-input lib-combobox-trigger', !value && 'is-empty')}
          >
            <span className="truncate">
              {value || 'Select or type an author…'}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="lib-combobox-pop" id={`${id ?? name}-listbox`}>
          <Command
            filter={(v, s) => (v.toLowerCase().includes(s.toLowerCase()) ? 1 : 0)}
          >
            <CommandInput
              placeholder="Search authors…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>No author found.</CommandEmpty>
              {allowCreate ? (
                <CommandGroup heading="Add new">
                  <CommandItem
                    value={`__new__:${query}`}
                    onSelect={() => pick(query.trim())}
                  >
                    + Use &ldquo;{query.trim()}&rdquo;
                  </CommandItem>
                </CommandGroup>
              ) : null}
              {options.length > 0 ? (
                <CommandGroup heading="Known authors">
                  {options.map((a) => (
                    <CommandItem key={a} value={a} onSelect={() => pick(a)}>
                      <Check
                        className={cn(
                          'mr-2 h-3.5 w-3.5',
                          value === a ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {a}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
