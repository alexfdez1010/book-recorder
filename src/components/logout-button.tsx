'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Ends the current session and navigates back to the login form. */
export function LogoutButton() {
  /** Clears the authentication cookie before leaving the private library. */
  async function handle() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }
  return (
    <Button onClick={handle} variant="ghost" size="sm" aria-label="Sign out">
      <LogOut className="h-3.5 w-3.5" strokeWidth={2.5} />
    </Button>
  );
}
