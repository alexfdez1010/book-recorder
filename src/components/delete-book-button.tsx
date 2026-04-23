'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteBookAction } from '@/lib/books/actions';

export function DeleteBookButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => deleteBookAction(id))}
      disabled={pending}
      className="lib-strike"
    >
      <Trash2 className="h-3 w-3" strokeWidth={2.5} />
      {pending ? 'Removing…' : 'Strike'}
    </button>
  );
}
