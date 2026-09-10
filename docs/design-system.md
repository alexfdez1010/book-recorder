# Reading room design system

The library uses warm white paper, charcoal text and a restrained green action color. Covers and serif book titles carry its identity; navigation, labels and metadata use the existing sans serif. Borders identify editable fields or separate navigation, rather than framing every item. Errors retain a distinct red treatment.

## Responsibilities

- `src/app/styles/theme.css` owns palette, Tailwind aliases, global keyboard focus and reduced motion. Preserve semantic variables so screens and chart adapters share the theme.
- Focused files under `src/app/styles/` own reusable component presentation, composed with Tailwind utilities. HeroUI remains responsible for accessible interaction and dialog state.
- Route components own grouping and content. Books and authors use month/author sections; their unframed entries become two columns only when there is room for readable titles. Metadata is a single line; actions remain visible on touch and keyboard.
- Saved opinions use native disclosure to keep longer notes available without overwhelming the collection.

Use `.lib-title` for page headings, `.lib-subtitle` for useful counts, `.lib-card` for book entries and `.lib-panel` for chart sections. Primary actions use the shared Button component; destructive actions require the existing confirmation dialog. Keep fields visibly distinct from the canvas and preserve a minimum 44px action target. Do not introduce decorative labels, ornamental borders or ambient animation.

## Verification

Run `bun run pre-commit` with the test database environment configured. Responsive Playwright coverage exercises 320px, 390px and 1440px screens, including login, all routes, adding, editing, deleting and marking books finished. Inspect the screenshots produced under `test-results/` before shipping visual changes. Use test credentials and the disposable test database, never production data.

## Official references

- [Tailwind CSS theme variables](https://tailwindcss.com/docs/theme)
- [HeroUI styling and component composition](https://heroui.com/en/docs/react/getting-started/styling)
- [Next.js font optimization](https://nextjs.org/docs/app/getting-started/fonts)
