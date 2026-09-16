# svyQRCode

Servoy web package that provides two QR Code components for the Servoy NGClient (TiNG) runtime:

- **QR Code** — a scanner that reads QR codes from the device camera and writes the decoded value into a dataprovider.
- **QR Code Generator** — renders a QR code onto a canvas from a dataprovider value.

The package targets **Servoy 2026.3 / Angular 21**. The scanner is shipped in both the legacy AngularJS (NG1) and the modern Angular (NG2) worlds, so it works in both clients. The generator is Angular-only.

## Installation

1. Download the latest `svyqrcode.zip` from the [releases page](https://github.com/Servoy/svyQRCode/releases).
2. In Servoy Developer, open the Web Package Manager and import the zip.
3. Drop **QR Code** or **QR Code Generator** onto a form from the palette (category **QR Code**).

## Components

### QR Code (scanner)

Reads QR codes from the device camera. When a code is detected, the decoded string is written into `dataProviderID` and the `onCodeDetected` handler is fired.

**Spec:** `svyqrcode/svyqrcode.spec` — component name `svyqrcode-svyqrcode`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dataProviderID` | dataprovider | — | Two-way bound; receives the decoded QR string. |
| `showCodeFrame` | boolean | `true` | Draw an outline around the detected code in the video preview. |
| `codeFrameColor` | color | `#FF3B58` | Color of the detection outline. |
| `callbackMethodTimeout` | int | `1000` | Minimum interval (ms) between two `onCodeDetected` calls when the same value keeps being detected. |

**Handlers**

| Handler | Parameters | Description |
|---------|-----------|-------------|
| `onCodeDetected` | `event: JSEvent`, `code: string` | Fired when a QR code is detected. Throttled by `callbackMethodTimeout`. |

**Notes**

- Requires HTTPS or `localhost`; browsers won't grant camera access on plain HTTP.
- Uses the rear camera when available (`facingMode: environment`).
- In the form designer no camera is opened; a placeholder is drawn instead.
- Decoding is provided by [`jsqr`](https://www.npmjs.com/package/jsqr).

### QR Code Generator

Renders a QR code from a value in `dataProviderID` onto a canvas.

**Spec:** `svyqrcodegenerator/svyqrcodegenerator.spec` — component name `svyqrcode-svyqrcodegenerator`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dataProviderID` | dataprovider | — | The string to encode. When empty, the canvas is cleared. |
| `qrSize` | int | `256` | Pixel size of the rendered QR code. |
| `errorCorrectionLevel` | string | `M` | One of `L`, `M`, `Q`, `H` (higher = more resilient to damage, but larger). |
| `foregroundColor` | color | `#000000` | Color of the QR modules. |
| `backgroundColor` | color | `#FFFFFF` | Background color. |
| `margin` | int | `4` | Quiet-zone margin in modules. |

**Handlers**

| Handler | Parameters | Description |
|---------|-----------|-------------|
| `onError` | `event: JSEvent`, `message: string` | Fired when the QR code could not be generated (e.g. too much data for the chosen error-correction level). |

**API**

| Method | Returns | Description |
|--------|---------|-------------|
| `getImageDataUrl()` | `string \| null` | Returns the current QR code as a PNG data URL (e.g. for saving to a media dataprovider or attaching to an email). |

**Notes**

- Encoding is provided by [`qrcode`](https://www.npmjs.com/package/qrcode).
- In the form designer, a checkerboard placeholder is drawn using the configured colors.
- The component fills the space allocated to it on the form; the canvas is centered inside and never exceeds the wrapper dimensions.

## Usage examples

### Read a QR code and act on it

```javascript
// onCodeDetected handler on the QR Code scanner
function onCodeDetected(event, code) {
    application.output('Scanned: ' + code);
    // do something with the value
}
```

### Generate a QR code from a text field

Bind a text field's `dataProviderID` and the generator's `dataProviderID` to the same variable — every change to the text field re-renders the QR code.

### Save the generated QR code as an image

```javascript
// on a button, after entering some text
var url = elements.qrCodeGenerator.getImageDataUrl();
if (url) {
    // strip the "data:image/png;base64," prefix and convert to bytes
    var base64 = url.substring(url.indexOf(',') + 1);
    var bytes = utils.stringToBytes(scopes.svySystem.decodeBase64(base64));
    // now save to a media dataprovider or write to disk
}
```

## Design-time behavior

Both components render a visible placeholder in the form designer so they can be moved and resized like any other component:

- **QR Code (scanner):** dark canvas with a colored frame (uses `codeFrameColor`). Default design size 640×480.
- **QR Code Generator:** checkerboard preview using the configured fore/background colors. Default design size 256×256.

The design-time footprint is controlled by a `designsize` property in each spec; adjust it once in the designer per instance to change the runtime size.

## Requirements

- Servoy 2026.3 or newer (Angular 21 runtime).
- HTTPS (or `localhost`) for the scanner, because browsers only expose `getUserMedia` in secure contexts.

## Development

The workspace layout mirrors the pattern used by [`aggridcomponents`](https://github.com/Servoy/aggridcomponents):

```
svyqrcode/                        # Servoy web package root
├── META-INF/MANIFEST.MF          # NG2-Module: SvyQRCodeModule, Entry-Point, NPM-PackageName
├── svyqrcode/                    # Servoy spec + AngularJS scanner (.js/.html) + jsQR lib
├── svyqrcodegenerator/           # Servoy spec + AngularJS stub for the Angular-only generator
├── projects/svyqrcode/           # Angular library (ng-packagr)
│   └── src/
│       ├── scanner/              # SvyQRCodeScanner (Angular)
│       ├── generator/            # SvyQRCodeGenerator (Angular)
│       ├── svyqrcode.module.ts   # NgModule that declares & exports both components
│       └── public-api.ts
├── angular.json / tsconfig*.json / .eslintrc.json / package.json
├── scripts/build.js              # zips META-INF + dist + spec folders into svyqrcode.zip
└── webpackage.json               # Servoy package descriptor + releases catalog
```

### Common commands

Run these from the `svyqrcode/` directory:

| Command | What it does |
|---------|--------------|
| `npm install --legacy-peer-deps` | Install dependencies. |
| `npm run build` | Production build of the Angular library into `dist/servoy/svyqrcode/`. |
| `npm run build_debug` | Same, in watch mode. |
| `npm run test_headless` | Run Karma/Jasmine tests once in headless Chrome. |
| `npm run test` | Karma in watch mode (Chrome). |
| `npm run lint` | ESLint over the Angular sources. |
| `npm run make_release` | Production build + `svyqrcode.zip`. |

### Notes for contributors

- The scanner is dual-layer: the AngularJS directive in `svyqrcode/svyqrcode.js` and the Angular component in `projects/svyqrcode/src/scanner/scanner.ts` must be kept in sync with the shared `.spec`.
- The generator is Angular-only; its `.js`/`.html` under `svyqrcodegenerator/` are minimal stubs so the Servoy `definition` resolves in NG1 mode, but the actual logic lives in the Angular component.
- Both components extend `ServoyBaseComponent` from `@servoy/public` and use `ChangeDetectionStrategy.OnPush`. Signal inputs (`input()` / `model()`) are used even though the components are `standalone: false` — signal inputs work on non-standalone components too on Angular 21.
- Do not add a real `size` property to the specs — Servoy reserves that name. Use `qrSize` (generator) and the `designsize` server-only property for the designer's default dimensions.

## License

MIT. See the git history / commits for authorship.

## Links

- Source: https://github.com/Servoy/svyQRCode
- Servoy documentation: https://docs.servoy.com
- `jsqr` (QR decoder): https://github.com/cozmo/jsQR
- `qrcode` (QR encoder): https://github.com/soldair/node-qrcode
