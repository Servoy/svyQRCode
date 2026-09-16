# Project Context — Servoy QR Code (Angular)

This project is the **Servoy QR Code** package — a QR code scanner and QR code
generator for the Servoy NGClient runtime. It is built as an Angular library using
ng-packagr and deployed as a Servoy web package. It also keeps legacy AngularJS
implementations for older Servoy runtime compatibility.

## Technology stack

| Aspect | Value |
|--------|-------|
| Angular version | 22.1.4 |
| TypeScript version | 6.0.3 |
| Build system | Angular CLI + ng-packagr 22.1.1 |
| Test framework | Vitest (via @angular/build:unit-test, jsdom) |
| Linting | ESLint 10.x with @angular-eslint + @typescript-eslint |
| Module system | ES modules (moduleResolution: "bundler") |
| Package name | @servoy/svyqrcode |
| Version | 2026.6.0 |

## Architecture: Dual-Layer Component Structure

Each component exists in **two layers**:

### Layer 1: Servoy Component Spec (`svyqrcode/<name>/`)
Top-level directories contain the **Servoy spec definition** and legacy assets:

| File | Purpose |
|------|---------|
| `<name>.spec` | Servoy component specification (JSON) — defines name, model properties, handlers, API methods, types |
| `<name>.js` | Legacy AngularJS client-side code |
| `<name>.html` | Legacy AngularJS template |

### Layer 2: Angular Library (`svyqrcode/projects/svyqrcode/src/<name>/`)
The modern Angular implementations:

| File | Purpose |
|------|---------|
| `<name>.ts` | Angular standalone component class |
| `<name>.html` | Angular template |
| `<name>.spec.ts` | Vitest unit test |

## Components

| Component | Type | Layer 1 (Spec) | Layer 2 (Angular) |
|-----------|------|----------------|-------------------|
| **QR Code (scanner)** | Reads QR codes from the device camera | `svyqrcode/svyqrcode.spec` | `projects/svyqrcode/src/scanner/` (`SvyQRCodeScanner`) |
| **QR Code Generator** | Renders a QR code from a dataprovider to a canvas | `svyqrcodegenerator/svyqrcodegenerator.spec` | `projects/svyqrcode/src/generator/` (`SvyQRCodeGenerator`) |

**Notes:**
- The scanner ships in both worlds: the AngularJS directive (`svyqrcode/svyqrcode.js`)
  and the Angular `SvyQRCodeScanner`. Both share the single `svyqrcode.spec`.
- The generator is **Angular-only**. Its `svyqrcodegenerator.js`/`.html` are a minimal
  AngularJS stub so the Servoy `definition` resolves; all logic is in the Angular
  component.
- The scanner uses the bundled `jsQR` library (via npm `jsqr`) for decoding.
- The generator uses the npm `qrcode` library for encoding/rendering.

## Angular Component Pattern

Components follow these conventions:
- **Selector prefix:** `svyqrcode-` (kebab-case, enforced by ESLint)
- **Directive selector prefix:** `svyqrcode` (camelCase)
- **Base class:** Both components extend `ServoyBaseComponent<T>` from `@servoy/public`
- **Standalone:** `true` — registered via `NG2-Components` in the MANIFEST
- **Change detection:** `ChangeDetectionStrategy.OnPush`
- **Signals:** Inputs use `input()` / `model()`; handlers are passed as `input()`
  function callbacks (matching the `.spec` handler contract)
- **Lifecycle:** Use `svyOnInit` / `svyOnChanges` from the base class; the main
  template element is marked `#element`

## Key project structure

```
svyQRCode/
├── svyqrcode/                              # Main working directory (Servoy package)
│   ├── angular.json                        # Angular workspace config
│   ├── package.json                        # Dependencies & scripts
│   ├── tsconfig.json                       # Root TypeScript config
│   ├── eslint.config.js                    # ESLint flat config
│   ├── projects/
│   │   ├── svyqrcode/                       # Angular library project
│   │   │   ├── ng-package.json
│   │   │   ├── src/
│   │   │   │   ├── public-api.ts            # Library exports
│   │   │   │   ├── scanner/                 # QR Code scanner (Angular)
│   │   │   │   └── generator/               # QR Code generator (Angular)
│   │   └── dummy/                           # Dummy app (dev/testing scaffold)
│   ├── svyqrcode/                           # Servoy spec + AngularJS scanner
│   ├── svyqrcodegenerator/                  # Servoy spec + AngularJS stub (generator)
│   ├── META-INF/MANIFEST.MF                 # Servoy package manifest (NG2-Components)
│   ├── webpackage.json                      # Servoy package descriptor
│   └── scripts/build.js                     # Release packaging script
└── README.md
```

## Key dependencies

| Package | Purpose |
|---------|---------|
| `@servoy/public` | Servoy framework base classes and utilities |
| `jsqr` | QR code decoding (scanner) |
| `qrcode` | QR code encoding/rendering (generator) |

## Build commands

| Command | Action |
|---------|--------|
| `npm run build` | Production build of the library |
| `npm run build_debug` | Build with watch mode |
| `npm run make_release` | Build + package into svyqrcode.zip |

## Testing

- **Framework:** Vitest (via `@angular/build:unit-test`, jsdom environment)
- **Commands:** `npm run test` (single run) / `npm run test:watch` (watch) / `npm run test:ui`
- **Pattern:** Each component has a `<name>.spec.ts` file alongside its implementation

## Linting

- ESLint flat config with `eslint:recommended`, `@typescript-eslint/recommended`, `@angular-eslint/recommended`
- All rules emit warnings (uses `eslint-plugin-only-warn`)
- Single quotes, max 200 char lines, 1TBS brace style
- Run: `npm run lint` from the `svyqrcode/` directory

## Code conventions

- Follow existing patterns in neighboring components — consistency over personal preference
- Use the `@servoy/public` base classes and utilities — never reinvent what's already provided
- Component selectors must use the `svyqrcode-` prefix
- No console.log in production code
- Always update `public-api.ts` when adding new exports

## Gotchas

- **The .spec file is NOT a test file.** It's the Servoy component specification (JSON)
  that defines the component's contract — model properties, handlers, API methods, types.
  Changes to the component contract REQUIRE updating this file.

- **`size` vs `designsize`:** If a spec's `size` isn't a real component input, it must be
  a `designsize` server-only private property (provides the designer's default dimensions).
  Both components fill `width:100%; height:100%` so the designer footprint matches `designsize`.

- **Dual-layer sync (scanner):** When changing scanner properties or API, the `.spec` file,
  the Angular component, and the AngularJS implementation must all be updated. The generator
  is Angular-only (its `.js`/`.html` are only stubs).

- **ng-packagr:** The library is built with ng-packagr. If adding a new component, it must be
  exported in `public-api.ts` and listed under `NG2-Components` in `META-INF/MANIFEST.MF`.

- **@servoy/public version coupling:** This package is tightly coupled to a specific Servoy
  platform version. The `@servoy/public` version must match the target runtime. The base
  class exposes `servoyApi`, `name`, and `elementRef` as signals — read them with `()`.

- **Camera / designer:** The scanner uses `getUserMedia` at runtime; in the designer it skips
  the camera and paints a placeholder. The generator paints a placeholder when there is no
  `dataProviderID` in the designer.

- **OnPush change detection:** All components use `ChangeDetectionStrategy.OnPush`. Drive UI
  changes through signals rather than manual change detection.
