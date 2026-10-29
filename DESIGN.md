---
name: Book Recorder
description: A quiet personal library with tactile books and clear reading data.
colors:
  leather: '#365b47'
  leather-hover: '#294a38'
  accent-soft: '#edf2eb'
  paper: '#f7f7f2'
  paper-soft: '#eeefe8'
  paper-edge: '#dfe3da'
  bone: '#ffffff'
  ink: '#252b28'
  ink-soft: '#4e5952'
  ink-mute: '#68716b'
  walnut: '#7c8973'
  chestnut: '#b5a182'
  oxblood: '#a14f43'
  brass: '#987231'
  moss: '#628b6c'
typography:
  display:
    fontFamily: "Fraunces, 'Iowan Old Style', Georgia, serif"
    fontSize: '2.625rem'
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: '-0.035em'
    fontVariation: "'opsz' 72, 'SOFT' 30"
  title:
    fontFamily: "Fraunces, 'Iowan Old Style', Georgia, serif"
    fontSize: '1.25rem'
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: '-0.02em'
  body:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
  metadata:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 400
rounded:
  badge: '6px'
  compact: '8px'
  control: '12px'
  panel: '14px'
  dialog: '16px'
spacing:
  1: '4px'
  2: '8px'
  3: '12px'
  4: '16px'
  5: '20px'
  6: '24px'
  8: '32px'
  10: '40px'
  12: '48px'
components:
  button-primary:
    backgroundColor: '{colors.leather}'
    textColor: '{colors.bone}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '10px 20px'
  button-primary-hover:
    backgroundColor: '{colors.leather-hover}'
  button-default:
    backgroundColor: '{colors.paper-soft}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '10px 20px'
  button-destructive:
    backgroundColor: '{colors.oxblood}'
    textColor: '{colors.bone}'
    rounded: '{rounded.control}'
    padding: '10px 20px'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-mute}'
    rounded: '{rounded.control}'
    padding: '10px 20px'
  button-link:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-mute}'
    rounded: '{rounded.control}'
    padding: '10px 4px'
  input:
    backgroundColor: '{colors.bone}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '12px 14px'
  navigation-active:
    backgroundColor: '{colors.paper-soft}'
    textColor: '{colors.leather}'
    rounded: '{rounded.control}'
    padding: '12px 16px'
  badge-accent:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.leather}'
    rounded: '{rounded.badge}'
    padding: '4px 8px'
  book-card:
    backgroundColor: '{colors.bone}'
    textColor: '{colors.ink}'
    rounded: '{rounded.panel}'
    padding: '20px'
  dialog:
    backgroundColor: '{colors.bone}'
    textColor: '{colors.ink}'
    rounded: '{rounded.dialog}'
---

# Design System: Book Recorder

## Overview

**Creative North Star: "The Personal Reading Room"**

The Personal Reading Room gives a private library a calm, spacious setting. Warm ivory supports white content surfaces, forest green identifies actions and selections, and real book covers give the collection its strongest visual detail. The language is editorial and approachable, with readable controls and visible actions.

Depth belongs chiefly to books and overlays. Covers lift slightly under a fine pointer; dialogs settle into focus over a softened backdrop. These short responses follow an action. Content is present immediately, without a staged entrance or ambient loop. This description records the implemented system; the user delegated its visual language.

**Key Characteristics:**

- Ivory canvas, white panels and restrained forest green controls.
- Fraunces for reading identity; Geist for navigation, labels and data.
- Spacious grouping with visible actions and purposeful motion.

## Colors

The palette pairs warm, lightly green neutrals with one primary action accent and muted chart series. Token values in the frontmatter are normative.

### Primary

- **Forest Binding** (`leather`): primary buttons, selected navigation, focus outlines and the current comparison series. `leather-hover` deepens primary buttons on hover.
- **Pale Leaf** (`accent-soft`): category badges and focused or selected picker options.

### Secondary

- **Quiet Sage** (`walnut`) and **Reading Moss** (`moss`): supporting chart series; the prior recent-performance window uses Quiet Sage.
- **Warm Chestnut** (`chestnut`) and **Muted Brass** (`brass`): additional categorical chart series. Brass also colors ratings.
- **Clay Red** (`oxblood`): destructive actions and errors; historical multiseries charts also use it as a categorical color.

### Neutral

- **Ivory Paper** (`paper`): the shared page canvas.
- **Folded Paper** (`paper-soft`): secondary controls, selected navigation and lifetime KPI surfaces.
- **Paper Edge** (`paper-edge`): form borders and meaningful separators.
- **White Page** (`bone`): cards, chart panels, dialogs, fields and the navigation rail.
- **Charcoal Ink** (`ink`): titles, reading copy and data values.
- **Soft Ink** (`ink-soft`): authors and supporting field labels.
- **Quiet Ink** (`ink-mute`): metadata, subtitles and inactive controls.

**The Shared Palette Rule.** Charts reference the same CSS palette as the interface; do not establish a separate hardcoded chart theme.

## Typography

**Display Font:** Fraunces, with Iowan Old Style and Georgia fallbacks.
**Body Font:** Geist, with system sans serif fallbacks.
**Label/Mono Font:** Geist labels; JetBrains Mono remains available for technical text.

Fraunces gives headings and book titles a literary character. Geist keeps controls and numerical comparisons compact and clear. Numbers use tabular figures throughout the document body. Fonts are loaded through `next/font` in the root layout.

### Hierarchy

- **Display:** the base page-heading role grows to 3.25rem from 640px; balanced wrapping keeps long headings contained.
- **Title:** book titles use the serif title role, up to three lines; list view reduces them to 1.125rem. Under 360px, grid titles reduce to 1.1rem.
- **Body:** the base role carries prose and fields. Subtitles use 0.875rem, relaxed leading and a 65ch maximum measure.
- **Label:** medium sans serif identifies controls. Metadata uses the smaller regular role, without decorative capitalization.
- **Data:** KPI values use sans serif at 1.875rem, medium weight and tight tracking; longer textual values reduce to 1.125rem.

**The Reading and Control Rule.** Use serif type for page and book identity, and sans serif for navigation, form controls and data.

## Layout

At 1024px and above, a fixed white navigation rail is 14rem wide. The main area offsets by the same amount, with a desktop workspace strip above the page. The content container is capped at 88rem; at 1664px the centered container reserves an 18rem inset for the rail. Below 1024px the header becomes sticky at the top, with a visible horizontal route strip.

The base horizontal page gutter is 20px, growing to 36px at 640px, 48px at 1024px and 64px at 1280px. Collection entries use one column until 1280px, then two. List view stays one column and moves actions alongside the entry at 1280px. Headers and toolbars wrap; search occupies a full row on narrow screens. Collection groups have 40px separation, with 20px between a group heading and its entries.

Recent-performance summaries have two columns on narrow screens and four from 640px; their two charts sit alongside each other from 1280px. Charts retain stable responsive containers. Labels, headings and essential actions remain available at 320px.

## Elevation & Depth

White surfaces separate content from ivory without a default panel border or heavy shadow. Small shadows make covers feel physical, distinguish selected view controls and lift overlays above their source. Fine separators organize group headings and action rows.

### Shadow Vocabulary

- **Book at rest** (`2px 4px 6px #2537281a, 5px 10px 20px #25372812`): the recurring cover silhouette.
- **Book lifted** (`3px 6px 8px #2537281a, 7px 15px 24px #25372820`): fine-pointer hover, paired with a 4px lift and small rotation.
- **Card response** (`0 8px 24px #25372808`): subtle hover around a book entry.
- **Primary action** (`0 3px 6px #365b4714`): shallow button depth; hover uses `0 4px 10px #365b4726`.
- **Picker overlay** (`0 12px 30px #2537281f`): searchable author and category popovers.
- **Dialog** (`0 24px 80px #1b30292e`): the highest content surface, over an 8px blurred backdrop.

**The Object Depth Rule.** Preserve the distinction between quiet content surfaces, tactile covers and elevated overlays.

## Shapes

Panels and book entries use the panel radius; controls and navigation use the control radius. Dialogs are slightly rounder. Badges use the badge radius; period tabs and count pills are fully rounded. A cover has a narrow left spine corner (2px) and softer right corners (6px), reinforced by inset spine shading. Fields keep a thin border; panels rely on surface color.

## Components

### Buttons

Controls are soft, compact and deliberate. The base target is at least 44px high, with medium sans serif text and the frontmatter padding. The larger variant is at least 48px high. Primary and accent variants share Forest Binding; default is Folded Paper, ghost is transparent, and destructive is Clay Red. Link buttons keep a small inline gutter and underline on hover. Disabled buttons have half opacity and a disabled cursor.

Color changes take 180ms; pressing scales the button to 0.96 over the shared 200ms easing. Keyboard focus uses a 2px Forest Binding outline with a 4px offset.

### Chips

Metadata badges are small and softly squared. Default badges use Ivory Paper and Quiet Ink; accent badges use Pale Leaf and Forest Binding. They communicate category or metadata and are not independent filtering controls.

### Cards / Containers

Book entries and chart panels use White Page and the panel radius. Book cards have 20px internal padding, 24px from 640px and 16px below 360px. Cover and text remain adjacent; actions wrap in a separated footer and stay visible. Saved opinions use a native disclosure. Chart headings use medium sans serif; lifetime KPIs use Folded Paper.

### Inputs / Fields

White fields have a Paper Edge stroke, the control radius and a 48px minimum height. Hover strengthens the border; focus uses a 2px Forest Binding outline with a 2px offset. Fields retain a 1rem text size. Disabled fields have half opacity. Errors use Clay Red text on a pale red surface.

Local collection search is a white composite field with an accessible label, a clear control and shared focus outline. Typing stays immediate while results use React's deferred value; the count is announced politely. Grid/list controls expose `aria-pressed` and a small white selected surface.

### Navigation

The white desktop rail uses icon-and-label rows with a quiet rounded active surface and a small green dot. Background and text color transition over 200ms. The compact header retains all routes in a horizontal strip, with icons above labels on its narrowest layout. The current route uses `aria-current="page"`.

### Book Covers, Dialogs and Charts

Cover motion is limited to fine-pointer hover. A cover lifts and rotates over 380ms using the shared ease, while spine shading stays fixed to the object. Generated fallback covers retain title and author when artwork is missing.

HeroUI's compound modal supplies accessible behavior. The backdrop enters over 240ms; the dialog settles from an 18px vertical offset and 0.97 scale over 360ms. Closing takes 160ms with a 10px offset and 0.98 scale. Preserve focus handling, close controls and inside scrolling.

Recent charts animate the current series for 400ms; historical distributions use 450ms. The prior comparison line stays steady and dashed. Reduced motion disables chart animation and reduces CSS motion to its final state. No content is gated behind animation.

## Do's and Don'ts

### Do:

- **Do** reuse the shared CSS palette for interface and chart colors.
- **Do** keep book actions visible for touch and keyboard users.
- **Do** honor reduced motion in both CSS and chart configuration.
- **Do** preserve the white surface and ivory canvas relationship.

### Don't:

- **Don't** hide essential controls behind hover.
- **Don't** add ambient loops or delay access to page content for an entrance sequence.
- **Don't** replace HeroUI's accessible modal and selection behavior with decorative replicas.
