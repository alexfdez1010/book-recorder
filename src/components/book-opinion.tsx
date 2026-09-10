/** Displays a saved opinion with preserved paragraphs; absent opinions render nothing. */
export function BookOpinion({ opinion }: { opinion: string | null }) {
  if (!opinion) return null;
  return (
    <details className="mx-4 mb-4 min-w-0 border-t border-paper-edge pt-3 sm:mx-5">
      <summary className="cursor-pointer py-2 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2">
        Opinion
      </summary>
      <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-soft [overflow-wrap:anywhere]">
        {opinion}
      </p>
    </details>
  );
}
