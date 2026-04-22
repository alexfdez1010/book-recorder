'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteBookAction } from '@/lib/books/actions';
import { cn } from '@/lib/utils';

export function DeleteBookButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => deleteBookAction(id))}
      disabled={pending}
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] font-bold',
        'text-blood border-b-2 border-blood pb-0.5',
        'hover:text-ink hover:border-ink disabled:opacity-50',
      )}
    >
      <Trash2 className="h-3 w-3" strokeWidth={2.5} />
      {pending ? 'Removing…' : 'Strike'}
    </button>
  );
}
