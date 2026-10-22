---
name: ux-ui-designer
description: >-
  Expert Antigravity Skill for designing world-class, premium UI/UX interfaces
  following the NTRevo Design System (Zinc Dark Mode #09090B, Flame Orange #FF4500,
  Glassmorphism cards #18181B, WCAG 2.1 AA contrast, and interactive Playwright E2E testing hooks).
---

# 🎨 UX/UI Designer & Frontend QA Specialist Skill

This skill provides deterministic rules, tokens, component patterns, and QA criteria for building state-of-the-art web interfaces that stun users at first glance while remaining 100% accessible and testable.

---

## 1. DESIGN TOKENS SPECIFICATION

### 1.1 Color Palette
* **Background Deep:** `#09090B` (Primary application canvas)
* **Elevated Card Surface:** `#18181B` with `backdrop-filter: blur(16px)`
* **Card Border Subtitle:** `#27272A` (1px solid crisp separation)
* **Primary Brand Accent:** `#FF4500` (Flame Orange - High energy, motivation)
* **Primary Accent Glow:** `rgba(255, 69, 0, 0.25)`
* **Secondary Energy Accent:** `#00F0FF` (Cyan - Technology & biometric analytics)
* **Success Indicator:** `#10B981` (Emerald - Optimal recovery / Test passed)
* **Warning Indicator:** `#F59E0B` (Amber - Modified intensity / Caution)
* **Critical Indicator:** `#EF4444` (Rose - Complete rest / Overtraining alert)

### 1.2 Typography & Hierarchy
* **Font Family:** `'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif`
* **Headings:**
  - `h1`: `font-size: 1.85rem; font-weight: 800; letter-spacing: -0.03em; color: #FFFFFF;`
  - `h2`: `font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; color: #F4F4F5;`
  - `h3`: `font-size: 1.10rem; font-weight: 600; color: #E4E4E7;`
* **Body Text:**
  - Standard: `font-size: 0.925rem; line-height: 1.6; color: #D4D4D8;`
  - Muted: `font-size: 0.85rem; color: #A1A1AA;`

---

## 2. COMPONENT BLUEPRINTS

### 2.1 Glassmorphic Card Pattern
```css
.card-glass {
    background: rgba(24, 24, 27, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid #27272A;
    border-radius: 14px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.36);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s;
}
.card-glass:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 69, 0, 0.4);
}
```

### 2.2 SVG Animated Score Ring (1-100)
* Use circular SVG progress stroke with `stroke-dasharray` and `stroke-dashoffset` calculated dynamically.
* Gradient fill transitioning from `#FF4500` to `#FF8C00`.

---

## 3. ACCESSIBILITY & WCAG 2.1 AA STANDARDS
1. **Contrast Ratio Requirement:**
   - Normal text (`< 18pt`): Must achieve $\ge 4.5:1$ against the background (e.g. `#FFFFFF` on `#18181B` achieves $15.8:1$).
   - Large text / Badges: Must achieve $\ge 3.0:1$.
2. **Keyboard Navigability:**
   - Interactive elements must support `:focus-visible` with outline `2px solid #FF4500` and offset `2px`.
3. **Screen Reader Compliance:**
   - Forms must have explicit `<label for="...">` associations.
   - Status chips and score rings must include descriptive `aria-label` tags.

---

## 4. E2E QA AUTOMATION IDENTIFIERS
Every interactive element MUST have descriptive semantic test attributes:
- `data-testid="btn-run-tests"`
- `data-testid="score-ring-readiness"`
- `data-testid="filter-status-passed"`
- `id="unique-semantic-identifier"`
