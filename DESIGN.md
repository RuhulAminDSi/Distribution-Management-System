# DESIGN.md - DMS Frontend Design System

## Overview

The DMS frontend uses **plain CSS with CSS Custom Properties** (no Tailwind, no CSS modules, no UI framework). The design system is defined in `frontend/src/styles/index.css` with component styles built on CSS variables for consistency.

**Key characteristics:**
- Blue primary (#1976D2) with green/orange/red semantic colors
- IBM Plex Sans + Noto Sans Bengali for bilingual support (English/Bangla)
- lucide-react for all icons
- Mobile-first responsive design (768px breakpoint)
- Card-based layout with subtle shadows

---

## Colors

### Brand & UI
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#1976D2` | Primary buttons, links, active states |
| `--primary-dark` | `#0D47A1` | Sidebar background, hover states |
| `--primary-light` | `#BBDEFB` | Light backgrounds, badge fills |
| `--secondary` | `#388E3C` | Success states, secondary actions |
| `--secondary-dark` | `#1B5E20` | Dark success variant |
| `--accent` | `#FF6F00` | Orange accent for highlights |
| `--danger` | `#D32F2F` | Error states, delete buttons |
| `--warning` | `#FFA000` | Warning badges, alerts |

### Surface & Text
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#F5F5F5` | Page background (light gray) |
| `--surface` | `#FFFFFF` | Card, modal, header backgrounds |
| `--text-primary` | `#212121` | Headings, body text |
| `--text-secondary` | `#757575` | Captions, secondary text |
| `--border` | `#E0E0E0` | Borders, dividers |

---

## Typography

### Font Family
```css
font-family: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif;
```

- **IBM Plex Sans** (weights: 300, 400, 500, 600, 700) — English text
- **Noto Sans Bengali** (weights: 400, 500, 600, 700) — Bangla text via `@fontsource/noto-sans-bengali`
- Loaded in `TopNav.jsx` via Google Fonts

### Hierarchy
| Element | Size | Weight | Usage |
|----------|------|--------|-------|
| `.page-title` / h1 | 24px | 600 | Page headers |
| `.card-title` / h3 | 16px | 600 | Card headings |
| `.stat-value` | 28px | 700 | Stat card numbers |
| `.header-title` | 18px | 600 | Top header text |
| `.form-label` | 14px | 500 | Form labels |
| `.form-input` / body | 14px | 400 | Default text |
| `.badge` | 12px | 500 | Badges, tags |
| `.table th` | 13px | 600 | Table headers (uppercase) |

---

## Layout

### Grid System
```css
.stats-grid     /* grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) */
.grid-2         /* grid-template-columns: repeat(2, 1fr) */
.grid-3         /* grid-template-columns: repeat(3, 1fr) */
```

### Spacing
- **Page padding**: 24px (`.page-content`)
- **Card padding**: 20px (`.card-body`), 16px 20px (`.card-header`)
- **Gap**: 16px (grids), 12px (form rows), 8px (small gaps)
- **Sidebar width**: 240px (`--sidebar-width`)
- **Header height**: 64px (`--header-height`)

---

## Components

### Buttons
```css
.btn              /* Base: padding 10px 16px, border-radius 8px, font-size 14px */
.btn-primary      /* Background: var(--primary), color: white */
.btn-secondary    /* Background: var(--background), border: 1px solid var(--border) */
.btn-success      /* Background: var(--success) */
.btn-danger       /* Background: var(--danger) */
.btn-sm           /* Padding: 6px 12px, font-size: 13px */
```

### Cards
```css
.card             /* Background: white, border-radius 12px, box-shadow */
.card-header      /* Padding: 16px 20px, border-bottom */
.card-body        /* Padding: 20px */

.stat-card        /* Stats grid card with icon */
.stat-icon        /* 48x48px, border-radius 12px (variants: .blue, .green, .orange, .red) */
.stat-value       /* 28px, font-weight 700 */
.stat-label       /* 14px, color: var(--text-secondary) */
```

### Forms
```css
.form-group       /* Margin-bottom: 16px */
.form-label       /* 14px, font-weight 500 */
.form-input       /* 100% width, padding 10px 12px, border-radius 8px */
.form-select      /* Same as input, plus cursor: pointer */
.form-row         /* grid-template-columns: 1fr 1fr (collapses to 1fr at 600px) */
.input-with-icon  /* Relative position, icon at left: 12px */
.input-error      /* Border-color: var(--danger), background: #FFEBEE */
.field-error      /* Error message: 12px, color: var(--danger), border-left: 3px solid var(--danger) */
```

### Tables
```css
.table-container  /* overflow-x: auto for horizontal scroll */
.table            /* width: 100%, border-collapse: collapse */
.table th         /* 13px, font-weight 600, text-transform: uppercase, background: var(--background) */
.table td         /* Padding: 12px 16px, border-bottom: 1px solid var(--border) */
.table tbody tr:hover /* background: var(--background) */
```

### Badges (Status Pills)
```css
.badge            /* display: inline-flex, border-radius: 20px, padding: 4px 10px, font-size: 12px */
.badge-success    /* background: #E8F5E9, color: var(--success) */
.badge-warning    /* background: #FFF3E0, color: var(--warning) */
.badge-danger     /* background: #FFEBEE, color: var(--danger) */
.badge-primary    /* background: var(--primary-light), color: var(--primary) */
.badge-secondary  /* background: #E0E0E0, color: #666 */
.badge-info       /* background: #E3F2FD, color: #1976D2 */
```

### Modals
```css
.modal-overlay    /* fixed inset, background: rgba(0,0,0,0.5), animation: fadeIn 0.2s */
.modal            /* background: white, border-radius: 16px, max-width: 500px, animation: slideUp 0.3s */
.modal-header     /* background: var(--primary), color: white, border-radius: 16px 16px 0 0 */
.modal-body       /* padding: 24px */
.modal-footer     /* background: var(--background), border-radius: 0 0 16px 16px */
```

### Navigation
```css
.sidebar          /* width: 240px, fixed position, background: var(--primary-dark), color: white */
.nav-item         /* padding: 12px 20px, border-left: 3px solid transparent */
.nav-item:hover   /* background: rgba(255,255,255,0.1) */
.nav-item.active  /* background: rgba(255,255,255,0.15), border-left-color: var(--accent) */
.nav-section-title/* 11px, uppercase, color: rgba(255,255,255,0.5), letter-spacing: 1px */

.header           /* height: 64px, background: white, border-bottom: 1px solid var(--border) */
.user-avatar      /* 36x36px, border-radius: 50%, background: var(--primary) */
.dropdown-menu    /* position: absolute, background: white, border-radius 8px, box-shadow */
```

### Alerts
```css
.alert            /* padding: 12px 16px, border-radius 8px, margin-bottom: 16px */
.alert-danger     /* background: #FFEBEE, color: var(--danger), border: 1px solid #FFCDD2 */
.alert-success    /* background: #E8F5E9, color: var(--success), border: 1px solid #C8E6C9 */
```

### Pagination
```css
.pagination-footer /* display: flex, justify-content: space-between, padding: 16px 20px */
.pagination-info   /* font-size: 13px, color: var(--text-secondary) */
.form-select.sm    /* width: auto, padding: 4px 8px, font-size: 13px */
```

---

## Responsive Breakpoints

| Breakpoint | Width | Key Changes |
|------------|--------|--------------|
| Extra Small | ≤480px | Stat value: 18px; modal width: 98%; buttons: 12px font |
| Mobile | ≤768px | Sidebar collapses (translateX(-100%)); grids become 1-column; font sizes reduce |
| Tablet | 769px–1024px | Stats grid: 2-column; grid-3: 2-column |
| Desktop | >1024px | Full sidebar (240px); full grid layouts |

### Mobile Behaviors
- Sidebar transforms to overlay with `.show` class (translateX(0))
- Tables become horizontally scrollable (`.table-container`)
- `.form-row` collapses to single column at 600px
- `.page-header` stacks vertically (flex-direction: column)
- `.modal-footer` buttons go full-width, stacked vertically

---

## Animations

```css
@keyframes spin    /* Loading spinners: rotate(360deg), 0.8s linear infinite */
@keyframes fadeIn  /* Modal overlay: opacity 0→1, 0.2s ease */
@keyframes slideUp /* Modal: translateY(20px) + opacity 0→1, 0.3s ease */
```

Loading spinner: 50×50px, border: 4px solid var(--border), border-top-color: var(--primary)

---

## Icons

All icons via **lucide-react** (`lucide-react` package). Common usage:
- Stat cards: 24px icons in `.stat-icon` containers
- Nav items: 20×20px SVG icons
- Buttons: inline icons with 8px gap
- Empty states: 64×64px, opacity: 0.5

---

## Bilingual Support

- Language toggle via `useLanguage()` hook (English ↔ Bangla)
- Font rendering: IBM Plex Sans for English, Noto Sans Bengali for Bangla
- Number/date/currency formatting handled by language context
- All UI text wrapped in translation function `t()`

---

## Do's and Don'ts

### Do
- Use CSS variables (`var(--primary)`, etc.) — never hardcode hex values in component styles
- Follow the existing class naming (`.btn-primary`, `.stat-card`, etc.)
- Test at 768px breakpoint — sidebar collapse is a key interaction
- Use `lucide-react` icons — don't import custom icon sets
- Wrap UI text in `t()` for bilingual support

### Don't
- Don't add Tailwind or other CSS frameworks — the project uses plain CSS
- Don't hardcode colors — use the CSS variable tokens
- Don't change the 240px sidebar width without updating `--sidebar-width`
- Don't use class names that conflict with existing components (check index.css first)
