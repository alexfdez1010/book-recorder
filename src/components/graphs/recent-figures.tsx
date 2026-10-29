import type { RecentDay } from '@/lib/stats/recent';

/** Exposes exact daily figures in a native disclosure for touch and assistive technology. */
export function RecentFigures({ points }: { points: RecentDay[] }) {
  return (
    <details className="mt-4 text-xs text-ink-mute">
      <summary className="min-h-11 w-fit cursor-pointer py-3 underline-offset-4 hover:text-ink hover:underline">
        View daily figures
      </summary>
      <div className="mt-2 max-h-64 overflow-auto rounded-xl bg-bone p-4">
        <table className="w-full text-left tabular-nums">
          <caption className="sr-only">
            Daily completed pages and books, with the preceding period aligned
            by day
          </caption>
          <thead>
            <tr>
              <th scope="col" className="pb-3 font-medium">
                Date (UTC)
              </th>
              <th scope="col" className="pb-3 font-medium">
                Books
              </th>
              <th scope="col" className="pb-3 font-medium">
                Pages
              </th>
              <th scope="col" className="pb-3 font-medium">
                Prior pages
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.date}>
                <th scope="row" className="py-1 font-normal">
                  {point.date}
                </th>
                <td>{point.books}</td>
                <td>{point.pages}</td>
                <td>
                  <span className="sr-only">On {point.previousDate}: </span>
                  {point.previousPages}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
