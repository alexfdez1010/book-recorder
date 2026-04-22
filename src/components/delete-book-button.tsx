'use client';

import { useTransition } from 'react';
import { deleteBookAction } from '@/lib/books/actions';

export function DeleteBookButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => deleteBookAction(id))}
      disabled={pending}
      className="mt-2 self-start rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
    >
      {pending ? 'Removing…' : 'Remove'}
    </button>
  );
}
