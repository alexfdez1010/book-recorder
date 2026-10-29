# Library experience direction

Mode: Operate. User delegated the direction and requested no questions. This session builds directly in code because the existing functional application is the design material; no image comp is an approval artifact.

## First viewport

A quiet, permanent navigation rail frames a spacious ivory collection. A compact book mark identifies the application; an editorial heading, useful collection totals and immediate search orient the reader. White horizontal entries give real book covers physical depth, with titles and authors adjacent. Ratings and actions remain visible. Content is available immediately.

## Material and type

Warm ivory #f7f7f2, white #ffffff, charcoal #252b28, secondary #68716b and forest #365b47. A single green accent identifies actions and selections. Fraunces carries book titles and the page heading; Geist carries controls, labels and data. Fourteen-pixel panel corners, gentle downward shadows on covers and overlays, fine neutral separators and generous grouping establish depth.

## Signature interaction

The cover responds to pointer focus with a small lift and a changing book-spine shadow. Search and grid/list changes preserve immediate access to content. The active navigation mark moves with a short eased transition. Modal presentation combines a subtle scale, vertical settling and backdrop focus, with an equally intentional close. Buttons have precise press feedback. Chart period changes update the same stable chart region. No ambient loops or delayed page-load choreography.

## Responsive and accessible

At 1024px the navigation becomes a compact top bar and visible horizontal route strip. At 320px content and actions wrap structurally. Preserve keyboard operation, focus return and semantic controls from HeroUI/React Aria. Honor reduced motion globally and in charts. Never hide essential actions behind hover.

## Architecture and verification

Single responsibility separates server loading, pure collection/recent-stat calculations and client interaction. Composition reuses existing action components. Existing Book data and adapter contracts remain stable. New pure logic receives deterministic tests; browser flows validate search, periods, forms, keyboard and overflow. Run the complete pre-commit gate before publishing.
