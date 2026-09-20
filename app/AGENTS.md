# ChimLab Agent Instructions

## Project scope

ChimLab is a client-side React 19 + TypeScript application built with Vite and Tailwind CSS. The interface provides chemistry calculations for chromatography, spectrometry, titration, solution preparation, and utility conversions.

- `src/main.tsx`: entry point, `StrictMode`, router, and global CSS.
- `src/App.tsx`: route registration, shared layout, and toaster.
- `src/pages/`: feature pages and user workflows.
- `src/components/`: shared application components; `src/components/ui/` contains Radix/shadcn-style primitives.
- `src/lib/calculations.ts`: reusable scientific formulas and interpretations.
- `src/lib/export.ts`: XLSX export behavior.
- `src/hooks/`: browser-local persistence and shared hooks.
- `src/types/index.ts`: shared domain types.

Keep calculation logic in `src/lib/calculations.ts` rather than duplicating formulas in pages. Preserve the existing public types and route structure unless the task explicitly changes them.

## Install and validate

Use Node.js 20 and npm from the `app` directory:

```bash
npm ci
npm run lint
npm run build
npm run dev
```

`npm run build` performs the TypeScript build followed by the Vite production build. There is currently no test script or test framework, so treat lint, build, and manual browser checks as the baseline verification. Use `npm run preview` to inspect the production build after a successful build.

When investigating an installation or environment issue:

1. Confirm the working directory is `app`.
2. Confirm Node.js is a compatible Node 20 release and npm is available.
3. Run `npm ci` from the lockfile before interpreting missing-module diagnostics.
4. Run `npm run lint` and `npm run build` separately so the failing stage is clear.
5. Report the exact command and first relevant error; do not hide dependency or TypeScript errors with configuration changes.

When checking whether the application works, start the Vite dev server, exercise each route in the browser, and verify calculation inputs, results, local history/storage, responsive navigation, and XLSX export. Do not call the absence of automated tests a passing test result.

## Implementation conventions

- Use TypeScript function components and keep strict TypeScript clean; avoid unused locals and parameters.
- Use the `@/` alias for imports from `src`.
- Prefer existing UI primitives and `lucide-react` icons before adding new dependencies or components.
- Use `cn()` from `src/lib/utils.ts` for composed class names.
- Keep styling consistent with the existing Tailwind utilities and global variables in `src/index.css`.
- Treat `localStorage` as the persistence boundary; there is no backend or API layer.
- Preserve French user-facing labels and scientific units unless the task requests a language change.
- Keep edits focused on the relevant page, shared calculation, hook, or UI primitive. Do not rewrite generated UI primitives to fix an application-level issue.

## Bug-fixing workflow

For a bug, first reproduce it with the smallest relevant route or calculation. Trace the value from the page input through the shared calculation/helper and back to the rendered result. Add or update a focused regression test only if a test setup is introduced; otherwise document the manual check used. After every fix, run the narrowest applicable check, then `npm run lint` and `npm run build` when the change crosses module boundaries.

For scientific calculations, check units, zero or negative denominators, missing optional inputs, rounding, and interpretation thresholds. Prefer explicit validation and clear user-facing errors over silently returning `NaN` or `Infinity`.

## Documentation

The Vite template README is [README.md](README.md), and generated setup notes are in [info.md](info.md). Keep this file limited to agent-specific guidance; put user-facing project documentation in the appropriate project documentation file.
