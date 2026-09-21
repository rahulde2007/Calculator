# Calcx-Pro

> A precision, production-grade professional calculator built for fast everyday calculations and advanced scientific workflows.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-273%20Passing-success.svg?logo=node.js&logoColor=white)](tests/engine/)
[![PWA](https://img.shields.io/badge/PWA-Offline_Ready-purple.svg?logo=pwa&logoColor=white)](public/manifest.webmanifest)

Calcx-Pro is a modern, responsive web application engineered for numerical accuracy, tactile responsiveness, and offline reliability. It combines a pure, framework-independent math parser with a high-contrast ergonomic interface designed for engineers, students, and professionals.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Standard Calculator](#standard-calculator)
  - [Scientific Calculator](#scientific-calculator)
  - [Memory Registers](#memory-registers)
  - [Calculation History](#calculation-history)
  - [Themes & Settings](#themes--settings)
  - [PWA & Offline Reliability](#pwa--offline-reliability)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Calculation Engine](#calculation-engine)
  - [Why eval() and Function() Are Prohibited](#why-eval-and-function-are-prohibited)
  - [Pipeline Stages](#pipeline-stages)
  - [Error Taxonomy](#error-taxonomy)
  - [Precision Normalization Strategy](#precision-normalization-strategy)
  - [Public Engine API](#public-engine-api)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Testing & Quality Verification](#testing--quality-verification)
- [PWA & Offline Architecture](#pwa--offline-architecture)
- [Data & Privacy](#data--privacy)
- [Security](#security)
- [Deployment](#deployment)
- [Browser & QA Notes](#browser--qa-notes)
- [Project Status](#project-status)
- [Roadmap & Milestones](#roadmap--milestones)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Calcx-Pro delivers a desktop-class engineering calculation experience directly in the browser:

- **Standard Calculator Mode**: Clean, distraction-free interface for rapid daily arithmetic, percentage operations, and operator chaining.
- **Scientific Calculator Mode**: Advanced mathematical toolkit featuring trigonometric, logarithmic, root, power, and factorial operations with multi-unit angle switching.
- **Local-First Architecture**: 100% client-side computation. All tokenization, parsing, evaluation, memory storage, and history management execute directly in the browser with zero server dependencies.
- **Responsive Ergonomics**: Tailored layouts adapting seamlessly across desktop monitors, laptops, tablets, and small-screen mobile devices down to 320px width.
- **Offline-Capable PWA**: Powered by Workbox service-worker precaching, enabling complete functionality even with intermittent or zero internet connectivity.

---

## Key Features

### Standard Calculator

- **Arithmetic Operations**: Precision addition (`+`), subtraction (`−`), multiplication (`×`), and division (`÷`).
- **Parentheses & Grouping**: Unlimited arbitrary nested parenthetical expressions with implicit multiplication injection.
- **Unary Minus Disambiguation**: Contextual minus detection allowing chained signs and negative numbers (e.g. `5 × -3`, `-(2 + 3)`).
- **Percentage Operator**: Contextual percentage calculations (`%`) normalized according to standard calculator semantics.
- **Smart Decimal Input**: Segment-aware decimal insertion preventing invalid inputs like `2.5.7`.
- **Tactile Backspace**: Smart deletion that removes individual characters or intact multi-character function tokens in one press.
- **Clear & All Clear (AC)**: Dual-level reset protecting session memory while clearing active display buffers.
- **Full Keyboard Support**: Seamless mapping for standard top-row numeric keys, dedicated desktop NumPad keys, and shortcut controls (`Enter`, `=`, `Backspace`, `Escape`).

### Scientific Calculator

- **Trigonometric Functions**: Standard (`sin`, `cos`, `tan`) and inverse functions (`asin`, `acos`, `atan`).
- **Logarithmic & Exponential**: Natural log (`ln`), base-10 log (`log`), and exponential (`exp`).
- **Radicals & Powers**: Square root (`sqrt`), cube root (`cbrt`), square (`x²`), and arbitrary right-associative power (`^`).
- **Combinatorics**: Integer factorial operator (`!`) supporting expressions like `5!` ($120$).
- **Mathematical Constants**: Built-in high-precision constants for $\pi$ (`pi`, `π`) and Euler's number ($e$).
- **Angle Unit Modes**: Instant switching between Degrees (`DEG`), Radians (`RAD`), and Gradians (`GRAD`) with automated trigonometric artifact cleanup (e.g. $\sin(180^\circ) = 0$, $\cos(90^\circ) = 0$).

### Memory Registers

- **Standard Operations**: Full suite of hardware-style registers: `MC` (Memory Clear), `MR` (Memory Recall), `M+` (Memory Add), and `M−` (Memory Subtract).
- **Visual Status Indicator**: Dedicated `M` badge in the primary Display element illuminating whenever memory holds a non-zero accumulator.
- **Session-Only Isolation**: In accordance with traditional precision calculator specifications, memory registers reside strictly in RAM and reset to `0` upon browser reload. Memory is preserved across `All Clear (AC)`.

### Calculation History

- **Comprehensive Audit Trail**: Automatically records successful calculations with original expression, formatted result, and relative timestamp.
- **Calculation Reuse**: Tap any history item to immediately load its expression and evaluated result for continuous arithmetic.
- **One-Click Clipboard**: Instant copying of raw expressions or numerical results with transient visual confirmation (`✓ Copied`).
- **Individual Deletion**: Remove individual calculations without affecting surrounding history or active accumulator registers.
- **Safe Clear All**: Protected by an accessible confirmation dialog with keyboard focus trapping to prevent accidental loss.
- **RFC 4180 CSV Export**: Export calculation records into compliant `.csv` files formatted for Excel, Google Sheets, and data tools.
- **Storage Bounding**: Strictly capped at the 50 most recent calculations to maintain instantaneous DOM rendering and respect storage quotas.

### Themes & Settings

- **Appearance Modes**:
  - **System**: Dynamically synchronizes with the host operating system's color scheme via `prefers-color-scheme`.
  - **Light**: Clean, high-contrast daylight aesthetic with subtle elevation shadows.
  - **Dark**: Deep cosmic navy interface engineered for low-light engineering sessions.
- **Zero-Flash Hydration**: Synchronous `<head>` inline script eliminates theme flicker on page refresh.
- **Accessibility & Motion**: Complies with `prefers-reduced-motion: reduce` by disabling animations, and provides $\ge 44\text{px} \times 44\text{px}$ touch targets across all interactive controls.
- **Persistent Preferences**: Saves selected theme, keypad mode, and angle unit across visits.

### PWA & Offline Reliability

- **Web App Manifest**: Fully installable standalone web application with custom brand theme colors and orientation metadata.
- **Service Worker Caching**: Workbox precaching captures the entire static application shell (HTML, CSS, JS, SVG assets, and icons).
- **Zero-Latency Launch**: Instant page loads on repeat visits with automated background cache updates (`registerType: 'autoUpdate'`).
- **Runtime Typography Caching**: Google Fonts stylesheets and webfont binaries are cached locally for dependable offline typography.
- **Clear Storage Boundaries**: Offline application caches operate completely independently from user calculation storage.

---

## Screenshots

*Screenshots will be added here.*

---

## Tech Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^18.3.1` | Declarative UI component architecture and state bindings |
| **TypeScript** | `^5.6.3` | Strict static typing, custom domain types, and zero `any` tolerance |
| **Vite** | `^5.4.11` | Ultra-fast build pipeline, path aliasing, and local development server |
| **Tailwind CSS** | `^3.4.16` | Semantic design tokens, responsive utilities, and dark-mode styling |
| **Node.js Test Runner & tsx** | `^4.23.15` | Native fast test runner executing TypeScript tests directly |
| **vite-plugin-pwa & Workbox** | `^1.3.0` | Service worker generation, Web App Manifest, and offline asset precaching |

---

## Architecture

Calcx-Pro is structured around a decoupled, local-first architecture where mathematics, state machines, storage, and presentation remain strictly isolated:

```text
Calcx-Pro/
├── public/                     # Static public assets & PWA manifest icons
│   ├── favicon.svg             # Application brand vector icon
│   └── icons/                  # 192px, 512px, and maskable PWA icons
├── src/
│   ├── assets/                 # Processed static image and vector assets
│   ├── components/             # React presentation components
│   │   ├── calculator/         # Display, Keypad, ScientificKeypad, AngleUnitSelector, MemoryControls
│   │   ├── common/             # Reusable primitives (IconButton, Modal)
│   │   ├── history/            # HistoryPanel, HistoryItem, ClearHistoryModal
│   │   └── settings/           # SettingsModal dialog
│   ├── engine/                 # Framework-independent mathematical computation engine
│   │   ├── constants.ts        # Math constants, operator registry, and error codes
│   │   ├── evaluator.ts        # Stack-based RPN evaluator & calculate() API
│   │   ├── functions.ts        # Scientific functions, power, factorial & domain validation
│   │   ├── index.ts            # Public engine barrel export
│   │   ├── operators.ts        # Operator precedence, associativity & arity definitions
│   │   ├── parser.ts           # Dijkstra's Shunting-Yard infix-to-RPN parser
│   │   ├── precision.ts        # IEEE 754 precision normalization strategy
│   │   ├── tokenizer.ts        # Lexical scanner & unary minus disambiguation
│   │   └── trigonometry.ts     # Angle conversions (DEG/RAD/GRAD) & trig artifact clamping
│   ├── hooks/                  # Custom React hooks (useCalculator, useKeyboard, useTheme)
│   ├── store/                  # Application state management & persistence
│   │   ├── calculatorStore.ts  # Canonical calculator reducer & initial state machine
│   │   └── persistence.ts      # Typed localStorage abstraction, validation & hydration
│   ├── styles/                 # Tailwind CSS styles and global variables (globals.css)
│   ├── types/                  # Shared TypeScript domain contracts (calculator.ts)
│   ├── utils/                  # Utility functions (clipboard, exportHistory, formatNumber, theme, validation)
│   ├── App.tsx                 # Root application shell with top bar, calculator, and history
│   ├── main.tsx                # Application mounting & service worker registration
│   └── vite-env.d.ts           # Vite client environment types
├── tests/
│   ├── components/             # Component rendering and integration tests
│   └── engine/                 # 12 comprehensive unit test suites covering the engine, store, and PWA
├── index.html                  # HTML entry point with early zero-flash theme script & PWA meta
├── package.json                # Project dependencies, metadata, and script runners
├── tailwind.config.js          # Custom theme colors, shadows, and typography configurations
├── tsconfig.json               # Strict TypeScript compiler options
└── vite.config.ts              # Vite configuration, path aliases (@/), and PWA Workbox settings
```

### Architectural Principles

1. **Framework-Independent Engine**: The directory `src/engine/` contains zero references to React, DOM elements, or window APIs. It can run in Node.js, Web Workers, or any JavaScript runtime.
2. **Deterministic State Machine**: `src/store/calculatorStore.ts` implements a pure reducer managing display state, buffered expressions, memory registers, calculation history, and user settings.
3. **Decoupled Persistence**: `src/store/persistence.ts` abstracts browser `localStorage` behind validation guards and schema versioning, protecting the app from quota exceptions and data corruption.
4. **Isolated Service Worker**: Precaching and runtime caching operate at the network layer without modifying the application's internal state.

---

## Calculation Engine

### Why `eval()` and `Function()` Are Prohibited

Calcx-Pro strictly avoids JavaScript's built-in `eval()` or `new Function()` constructors:

- **Security Assurance**: `eval()` introduces severe cross-site scripting (XSS) and arbitrary code execution vectors. Calcx-Pro exclusively executes tokenized mathematical primitives.
- **Deterministic Diagnostics**: Native `eval()` produces generic runtime exceptions. Calcx-Pro outputs structured error categories (`DivisionByZero`, `ScientificDomainError`, `MismatchedParentheses`) with detailed error messages.
- **Precision Control**: `eval()` subjects raw calculations to binary IEEE 754 floating-point inaccuracies (e.g. `0.1 + 0.2 = 0.30000000000000004`). The Calcx-Pro engine normalizes every intermediate operation.

### Pipeline Stages

```text
Infix Expression String (e.g. "2 × sin(30) + 5!")
           │
           ▼
    [ Tokenizer ]       (src/engine/tokenizer.ts)
           │            - Lexical analysis & validation
           │            - Multi-digit and floating-point grouping
           │            - Unary minus disambiguation
           │
           ▼ (Token Stream)
    [   Parser   ]      (src/engine/parser.ts)
           │            - Dijkstra's Shunting-Yard Algorithm
           │            - Enforces precedence & right/left associativity
           │            - Parentheses validation & function stacking
           │
           ▼ (RPN Output Queue)
    [  Evaluator ]      (src/engine/evaluator.ts)
           │            - Postfix stack evaluation
           │            - Mathematical domain constraint verification
           │            - Precision normalization & artifact cleanup
           │
           ▼
    CalculationResult ({ success: true, value } | { success: false, error })
```

### Error Taxonomy

When an expression cannot be evaluated, the engine returns a structured error object containing a standardized error code:

- `SyntaxError`: Consecutive operators, missing operands, empty parentheses, or trailing operators.
- `InvalidExpression`: Unrecognized characters or empty expression inputs.
- `MismatchedParentheses`: Unclosed `(` or stray `)` brackets.
- `DivisionByZero`: Division or modulo by zero.
- `ScientificDomainError`: Out-of-bounds inputs:
  - Negative square or even roots (`sqrt(-1)`)
  - Non-positive logarithms (`ln(0)`, `log(-5)`)
  - Out-of-range inverse trigonometric arguments ($|x| > 1$ in `asin`, `acos`)
  - Undefined tangent asymptotes ($\tan(90^\circ)$, $\tan(270^\circ)$)
  - Negative or non-integer factorials (`(-4)!`, `3.2!`)
- `ArithmeticOverflow`: Operations exceeding IEEE 754 double precision ($> 170!$, $> 10^{308}$).
- `StackError`: Internal stack underflow or mismatched operands.

### Precision Normalization Strategy

Binary double-precision floating-point numbers provide ~15.95 decimal digits of precision. Binary representation limitations naturally introduce rounding jitter at the 16th and 17th digits.

Calcx-Pro normalizes arithmetic results using a **14 significant digit precision strategy** (`parseFloat(value.toPrecision(14))`):

- Preserves full precision for large integers (up to $10^{14}$) and minute decimals (down to $10^{-300}$).
- Eliminates binary artifacts such as `0.1 + 0.2 = 0.30000000000000004` $\to$ `0.3`.
- Normalizes negative zero (`-0`) to `0`.
- Clamps near-zero floating artifacts in trigonometric evaluations (e.g. $\sin(180^\circ) = 0$, $\cos(90^\circ) = 0$).

### Public Engine API

The calculation engine is exported as a standalone module:

```ts
import { calculate } from './src/engine';

// Standard Arithmetic
const res1 = calculate('2 + 3 * 4');
// => { success: true, value: 14 }

// Parentheses & Unary Minus
const res2 = calculate('-(2 + 3) * 4');
// => { success: true, value: -20 }

// Precision Normalization
const res3 = calculate('0.1 + 0.2');
// => { success: true, value: 0.3 }

// Scientific Trigonometry (Degrees default)
const res4 = calculate('sin(30)');
// => { success: true, value: 0.5 }

// Angle Units: Radians and Gradians
const res5 = calculate('sin(pi / 2)', { angleUnit: 'rad' });
// => { success: true, value: 1 }

const res6 = calculate('sin(100)', { angleUnit: 'grad' });
// => { success: true, value: 1 }

// Exponentiation (Right-Associative: 2^3^2 = 2^(3^2) = 512)
const res7 = calculate('2 ^ 3 ^ 2');
// => { success: true, value: 512 }

// Factorial Operator (!)
const res8 = calculate('5!');
// => { success: true, value: 120 }

// Domain Error Handling
const err = calculate('sqrt(-1)');
// => {
//   success: false,
//   error: {
//     code: 'ScientificDomainError',
//     message: "Square root argument '-1' must be non-negative"
//   }
// }
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rahulde2007/Calcx-Pro-calculator.git
   cd Calcx-Pro
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the local development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## Available Scripts

The following commands are configured in `package.json`:

- `npm run dev`: Starts the Vite local development server with instant Hot Module Replacement (HMR) at `http://localhost:5173`.
- `npm run build`: Compiles strict TypeScript (`tsc`) and generates optimized production assets with Workbox service worker into `dist/`.
- `npm run preview`: Spins up a local static server to preview the production build output at `http://localhost:4173`.
- `npm run typecheck`: Runs strict TypeScript type verification across the entire project with zero emission (`tsc --noEmit`).
- `npm test`: Executes all engine, persistence, store, and PWA unit tests using Node.js native test runner via `tsx`.

---

## Testing & Quality Verification

Calcx-Pro includes an extensive automated test suite validating the entire computation pipeline, storage layer, memory operations, and PWA metadata.

### Current Verified Test Status

- **Total Tests**: 273 passing
- **Test Suites**: 80 passing
- **Failures / Errors**: 0
- **Execution Time**: ~0.7 seconds
- **TypeScript Strict Check**: 0 errors (`tsc --noEmit`)
- **Production Build**: Verified with Vite and Workbox precaching

> *Note: These figures reflect the current verified state of the codebase.*

### Running Tests

Execute the full suite with:

```bash
npm test
```

Perform strict static analysis:

```bash
npm run typecheck
```

---

## PWA & Offline Architecture

Calcx-Pro is built from the ground up to operate reliably without network access:

- **Web App Manifest (`public/manifest.webmanifest`)**: Provides application metadata, background/theme colors (`#090D16`), standalone display mode, and high-resolution icons (192x192, 512x512, and 512x512 maskable).
- **Workbox Service Worker (`dist/sw.js`)**: Automatically generated during `npm run build` using `vite-plugin-pwa`. It precaches all HTML, CSS, JavaScript, and SVG icons.
- **Runtime Caching Strategies**:
  - **Google Fonts Stylesheets**: Cached using `StaleWhileRevalidate` with an expiration window of 365 days.
  - **Google Webfonts (`woff2`)**: Cached using `CacheFirst` with a quota of up to 30 entries for 365 days.
- **Auto-Updating Lifecycle**: Configured with `registerType: 'autoUpdate'`, enabling seamless service worker updates when new versions are deployed without freezing active sessions.
- **HTTPS Requirement**: Service worker registration and PWA installation require a secure context (HTTPS in production or localhost during local development).
- **Storage Independence**: The Service Worker cache storage stores only static code assets. User calculation history and preferences remain protected in `localStorage`.

---

## Data & Privacy

- **100% Local Processing**: All mathematical operations, expressions, and conversions are computed entirely on the client device.
- **Zero Telemetry**: No third-party trackers, analytics libraries, advertising cookies, or behavioral beacons are present in the codebase.
- **No External Database**: Calcx-Pro requires no backend server, account creation, or database connections.
- **Session Memory Boundary**: Memory registers (`MC`, `MR`, `M+`, `M−`) are strictly kept in transient memory and are discarded when the browser session ends.
- **Local Storage Scoping**: Calculation history (up to 50 items) and user preferences (theme, keypad mode, angle unit) are saved exclusively to the browser's local storage domain.

---

## Security

Calcx-Pro adheres to secure coding standards for client-side web applications:

- **No Dynamic Code Evaluation**: Strict avoidance of `eval()`, `new Function()`, and `setTimeout(string)`. Mathematical evaluation is restricted to safe AST-like RPN execution.
- **Sanitized Local Storage**: Persistent data parsing is wrapped in defensive `try/catch` blocks and validated against strict schemas before hydration to prevent prototype pollution or corrupted state crashes.
- **Zero Secrets**: The application contains no API keys, credentials, or private tokens. All static assets and code are client-safe.
- **RFC 4180 CSV Escaping**: History export functions sanitize and escape comma, quote, and newline characters, guarding against CSV formula injection vulnerabilities in spreadsheet applications.

### Recommended Production Security Headers

When serving Calcx-Pro from a production CDN or static host, the following HTTP headers are recommended:

```http
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Deployment

Because Calcx-Pro compiles into pure static assets (`HTML`, `CSS`, `JS`), it can be hosted on any static hosting platform:

### 1. Build Production Bundle

```bash
npm run build
```

This compiles all files and outputs the production bundle to the `dist/` folder.

### 2. Static Hosting Targets

#### Vercel

Deploy using the Vercel CLI or Git integration:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Netlify

Deploy using the Netlify CLI or repository link:

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

#### Cloudflare Pages

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### GitHub Pages

To host on a custom repository subpath (e.g. `https://<user>.github.io/Calcx-Pro/`), configure the `base` property in `vite.config.ts`:

```ts
export default defineConfig({
  base: '/Calcx-Pro/',
  // ...
});
```

Build and push the `dist/` directory to your `gh-pages` deployment branch.

---

## Browser & QA Notes

- **Verified Verification Pipeline**: The project has undergone automated unit/integration testing (273 tests), TypeScript strict validation (`tsc --noEmit`), and production bundle generation.
- **Headless Testing Environment**: Automated browser end-to-end visual tests (e.g. Playwright) were not executed due to local container constraints; all UI state machines, formatters, and mathematical operations are covered by automated unit and integration tests.
- **Browser Compatibility**: Compatible with modern evergreen desktop and mobile browsers supporting ES2020+ (Chrome, Firefox, Safari, Edge).

---

## Project Status

> **Status: Production-Ready Implementation**

Calcx-Pro is a complete, stable, and verified precision calculator. Key validation metrics:

- **273 / 273 Automated Tests Passing**
- **Strict TypeScript Check Passing (0 Errors)**
- **Production Build Succeeded**
- **PWA Offline Service Worker Generated**

---

## Roadmap & Milestones

The current implementation represents the completion of all 11 core development milestones:

- **Step 1 (Complete)**: Foundational Architecture & Decoupled Contracts
- **Step 2 (Complete)**: Premium Design System & Tactile Accessible UI Foundation
- **Step 3 (Complete)**: Pure Calculation Engine, Tokenizer, Shunting-Yard Parser & 77 Tests
- **Step 4 (Complete)**: Interactive Reducer State Machine, UI Integration & Keyboard Mapping
- **Step 5 (Complete)**: Scientific Calculation Engine, Trigonometry, Powers & Domain Bounds
- **Step 6 (Complete)**: Scientific Keypad UI, Responsive Layout & Angle Unit Selector
- **Step 7 (Complete)**: Hardware-Grade Memory Registers (`MC`, `MR`, `M+`, `M−`) & Accumulator
- **Step 8 (Complete)**: Resilient Persistence Layer & User Preferences (`localStorage`)
- **Step 9 (Complete)**: History Management, Clipboard Actions & RFC 4180 CSV Export
- **Step 10 (Complete)**: System / Light / Dark Themes, Settings Modal & Accessibility Polish
- **Step 11 (Complete)**: PWA Web App Manifest, Service Worker Precaching & Production Readiness

---

## Contributing

Contributions, bug reports, and feature proposals are welcome.

Before submitting a pull request:

1. Keep changes focused and atomic.
2. Add or update unit tests in `tests/engine/` to cover new logic or bug fixes.
3. Verify that the entire test suite passes:

   ```bash
   npm test
   ```

4. Verify strict TypeScript compliance:

   ```bash
   npm run typecheck
   ```

5. Confirm that the production bundle compiles without warnings:

   ```bash
   npm run build
   ```

---

## License

License: Not specified yet.
