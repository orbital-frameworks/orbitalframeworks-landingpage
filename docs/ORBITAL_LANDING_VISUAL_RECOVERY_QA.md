# Orbital Landing Visual & ProofHub E2E Recovery QA Report

**Date:** 2026-10-17
**Scope:** `src/ProofHubPage.tsx`, `src/ProofHubPage.css`, `scripts/verify-wasy-visual.mjs`, `tests/`
**Execution Node:** `visual-e2e-recovery`
**Status:** PASS

---

## 1. Executive Summary

This report documents the audit, repair, and end-to-end verification of the Evidence/ProofHub page, responsive viewport layouts (320px, 390px, 768px, 1440px), official Gmail compose CTA, and screenshot EROFS resilience in `orbitalframeworks-landingpage`.

All checks passed with zero errors, zero regressions, and zero fabricated claims or social proof.

---

## 2. Audit: HEAD vs Pending Defects

### 2.1 What was already corrected in HEAD (`b92da0d`)
- **Natural Image Dimensions**: `src/ProofHubPage.tsx` configured explicit intrinsic dimensions for all four portfolio items:
  - Localisa: `1905 × 852` (aspect ratio ~2.2359)
  - Wasy: `960 × 704` (aspect ratio ~1.3636)
  - Checkio: `1917 × 904` (aspect ratio ~2.1205)
  - PeruLog Pallets: `1336 × 601` (aspect ratio ~2.2229)
- **CSS Aspect Ratio & Fit**: `src/ProofHubPage.css` updated `.proofItemMedia img` to use `width: 100%; height: auto; aspect-ratio: auto; object-fit: contain;`, removing the restrictive `aspect-ratio: 16/10` and `object-fit: cover` that previously cropped and distorted project previews.
- **Gmail Compose CTA**: `src/ProofHubPage.tsx` wired the primary conversion button to `https://mail.google.com/mail/?view=cm&fs=1&to=contact.orbitalframeworks%40gmail.com` with pre-filled subject and structured inquiry template.
- **Visual CDP Assertion Base**: Added assertions in `scripts/verify-wasy-visual.mjs` checking that all four images load and preserve aspect ratios within 0.025 delta tolerance.

### 2.2 What remained pending / uncommitted and was resolved
- **EROFS Resilience in Screenshots (`scripts/verify-wasy-visual.mjs`)**:
  - In sandbox/container environments where `process.env.QA_SCREENSHOT_DIR` or root directories are mounted read-only, `mkdirSync` and `writeFileSync` threw `EROFS` / `EACCES` crashes.
  - Implemented `try/catch` fallback blocks both at initialization and screenshot capture time to redirect output to `resolve(join(tmpBase, 'orbital-landing-visual-qa'))`.
- **Sandbox-Resilient Dist Resolution (`tests/engagement-ux.test.mjs`)**:
  - Dist directory resolution safely checks `/tmp/orbital-dist` when default `dist/` is read-only.
  - Consolidated imports cleanly without syntax drift.
- **Dedicated ProofHub & Visual Unit Tests (`tests/proof-hub-visual-and-cta.test.mjs`)**:
  - Added unit test suite covering:
    1. Prerendered HTML existence and official Gmail compose CTA verification.
    2. Exact natural aspect ratio validation across all 4 projects without distortion.
    3. CSS responsive rules (`object-fit: contain`, `height: auto`, `width: 100%`, `overflow: clip`).
    4. EROFS/EACCES error fallback handling in `verify-wasy-visual.mjs`.
    5. Viewport audit coverage (320, 390, 768, 1440) on the evidence route.
    6. Responsive breakpoints (`@media (max-width:920px)` and `@media (max-width:640px)`).

---

## 3. Viewport Verification Matrix

Visual test suite `scripts/verify-wasy-visual.mjs` evaluated all routes against headless Chrome:

| Viewport Name | Resolution | Route: `/evidencia/` | Image Natural Ratios Preserved | Horizontal Overflow | CTA Destination |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `mobile-320` | 320 × 760 | PASS | YES (all 4 projects within 0.025 delta) | NO (`overflow: false`) | Gmail Compose (`contact.orbitalframeworks@gmail.com`) |
| `mobile-375` | 375 × 812 | PASS | YES (all 4 projects within 0.025 delta) | NO (`overflow: false`) | Gmail Compose (`contact.orbitalframeworks@gmail.com`) |
| `mobile` (390) | 390 × 844 | PASS (captured) | YES (all 4 projects within 0.025 delta) | NO (`overflow: false`) | Gmail Compose (`contact.orbitalframeworks@gmail.com`) |
| `mobile-414` | 414 × 896 | PASS | YES (all 4 projects within 0.025 delta) | NO (`overflow: false`) | Gmail Compose (`contact.orbitalframeworks@gmail.com`) |
| `tablet-768` | 768 × 1024 | PASS | YES (all 4 projects within 0.025 delta) | NO (`overflow: false`) | Gmail Compose (`contact.orbitalframeworks@gmail.com`) |
| `desktop` | 1440 × 1057 | PASS (captured) | YES (all 4 projects within 0.025 delta) | NO (`overflow: false`) | Gmail Compose (`contact.orbitalframeworks@gmail.com`) |

---

## 4. Verification Commands & Outputs

### 4.1 Linting & Typecheck
```bash
$ npm run lint
> eslint .
# Exit code 0 (0 errors, 0 warnings)

$ npm run typecheck
> tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit
# Exit code 0 (clean compilation)
```

### 4.2 Unit & Integration Tests
```bash
$ DIST_DIR=/tmp/orbital-dist npm test
> node --test tests/*.test.mjs
# 48 tests passed, 0 failed, 0 cancelled (5.75s)
```

### 4.3 Visual Verification Script
```bash
$ DIST_DIR=/tmp/orbital-dist node scripts/verify-wasy-visual.mjs
# Passes all 6 viewports across home, case, evidence, checkio, localisa, and perulog routes.
# Output: WASY_VISUAL_QA_PASS
# Output: QA_SCREENSHOT_DIR /tmp/orbital-landing-visual-qa
```

---

## 5. Compliance & Guardrails

- **Zero Hallucinations:** No fabricated metrics, testimonials, partners, or client logos added.
- **Contact Channels:** Official email `contact.orbitalframeworks@gmail.com` preserved consistently across all CTAs.
- **Preservation of Work:** Untracked assets and docs from concurrent work packages (`docs/BLOG_TO_LINKEDIN_*`, `docs/SPONSOR_*`, `public/wasy*`) were strictly preserved and untouched.
