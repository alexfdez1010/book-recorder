'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  async function handle() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }
  return (
    <Button onClick={handle} variant="destructive" size="sm" aria-label="Sign out">
      <LogOut className="h-3.5 w-3.5" strokeWidth={2.5} />
    </Button>
  );
}
