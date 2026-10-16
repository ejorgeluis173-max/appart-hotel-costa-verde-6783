# Costa Verde — Design

Inspiración: referencia editorial proporcionada, portada fotográfica, tipografía serif, espacio generoso y bloques verdes oscuros. No copiar textos. Web responsive en español.

Paleta definitiva: crema #f6f4ed, verde bosque #233c32, oliva #7d8769, tinta #29372f y beige #e7e3d7. Cormorant Garamond en títulos, Poppins en interfaz, ambas locales. Contenedor 1200px, ritmo vertical 96px (60px móvil), líneas finas, botones discretos. Portada exterior con superposición verde para contraste, título central, acciones y consulta debajo. Servicios y reservas sobre verde profundo.
Solo datos confirmados: catálogo vacío hasta editarlo, precios de referencia sin total ficticio, distribución de estrellas sin inventar, reseñas con moderación en base de datos. Galería con fotos de referencia identificadas. Sin pagos ni panel administrativo público. Formularios con fechas validadas y estado de carga. Respeto por reduced-motion.

## Brand & Colors

One token set, consumed per platform:

- **Web & desktop**: CSS variables in `packages/web/src/web/styles.css` (desktop loads the web UI).
- **Mobile**: `Colors.light` / `Colors.dark` in `packages/mobile/constants/theme.ts`, read via `useColors()`; `userInterfaceStyle: "automatic"` follows the system light/dark setting.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| primary | #1F1F1F | #E5E5E5 | Buttons, active tab, accents |
| background | #FFFFFF | #0A0A0A | Page/screen background |
| card | #FFFFFF | #1A1A1A | Cards, surfaces |
| foreground | #171717 | #FAFAFA | Primary text |
| mutedForeground | #737373 | #A3A3A3 | Secondary text |
| border | #E5E5E5 | #262626 | Hairlines |
| destructive | #DC2626 | #EF4444 | Delete / errors |

## Typography

Name the display + body pairing here. Web: set font families in `styles.css` (self-hosted files go in `packages/web/public/fonts/`). Mobile: system font by default; load custom fonts with `useFonts` from `expo-font` and reference them via `Fonts` in `constants/theme.ts`.

## Pages & Screens

List each page/screen, its route file, and what it shows. Example:

- **Web — Home** (`packages/web/src/web/pages/index.tsx`) — what the user sees first.
- **Mobile — Home** (`packages/mobile/app/(tabs)/index.tsx`) — main tab.
- Add web pages under `src/web/pages/` (+ route in `app.tsx`); mobile tabs under `app/(tabs)/`, stack/modal screens under `app/`.

## Key User Flows

1. Describe the primary flow end to end (open → action → result).
2. ...

## Architecture

- **API**: typed oRPC client (`lib/api.ts` in each package) → the backend in `@template/web`. Query/mutation hooks live in `queries/` (one file per feature); pages/screens call them with `@tanstack/react-query`.
- **State/sync**: TanStack Query with optimistic updates for instant-feel interactions.
- **Auth / payments / uploads**: see `skills/app/references/` when those features are needed.
