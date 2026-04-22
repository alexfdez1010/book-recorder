'use client';

export function LogoutButton() {
  async function handle() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }
  return (
    <button
      onClick={handle}
      className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
    >
      Logout
    </button>
  );
}
