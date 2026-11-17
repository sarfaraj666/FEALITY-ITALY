# FEALITY ITALY — Luxury Italian Living & Kitchen Systems

Official web platform for **FEALITY ITALY**, showcasing modular Italian kitchens, wardrobes, vanities, and balconies, complete with a zero-VPS serverless customer enquiry pipeline directly connected to Google Sheets and instant email alerts.

---

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [What Has Been Done (Changelog & Milestones)](#what-has-been-done-changelog--milestones)
   - [UI & Frontend Bug Fixes](#1-ui--frontend-bug-fixes)
   - [Desktop Hover & Tactile Click Micro-Interactions](#2-desktop-hover--tactile-click-micro-interactions)
   - [Zero-VPS Google Sheets Backend Integration](#3-zero-vps-google-sheets-backend-integration)
3. [Live Lead Management & Excel Download](#live-lead-management--excel-download)
4. [Deployment & Free Hosting](#deployment--free-hosting)
5. [Project Structure](#project-structure)

---

## Overview & Architecture

FEALITY ITALY delivers an editorial design experience for luxury interiors with a **100% serverless, zero-maintenance static architecture**:
* **Frontend**: Pure semantic HTML5, modern CSS3 with luxury typography and micro-interactions, vanilla ES6+ client scripts. No frameworks or heavy bundles.
* **Production Backend (Zero-VPS / 100% Free Forever)**: Customer forms submit directly via secure HTTPS to a private Google Apps Script webhook that records incoming leads in real-time into a private Google Spreadsheet and triggers instant email alerts.
* **Zero Monthly Cost**: Requires **no VPS**, no server daemons, no database maintenance, and zero hosting fees.
* **Admin Management**: Full access to all enquiries anytime via Google Sheets (web or free mobile app) with live sorting, search, filtering, and 1-click download as Microsoft Excel (`.xlsx`) or `.csv`.

---

## What Has Been Done (Changelog & Milestones)

### 1. UI & Frontend Bug Fixes
* **Cleaned Search Toggle**: Removed the circular border and background from `#siteHeader .search-toggle` for a clean, minimalist magnifying glass icon.
* **Restored Classic Search Panel**: Restored the warm cream background (`#e9e8e2`), clean `CLOSE ×` button, and divided result rows matching the brand aesthetic.
* **Removal of Diagonal Arrow Glyphs (`↗`)**: Cleaned obsolete unicode arrow boxes across all 20 HTML pages, search result lists, gallery cards, and navigation links.
* **Unified Balcony Lightbox & Perspective Navigation**: Integrated perspective side designs (`FealityBalconySideDesigns`) with `kitchen-gallery.js` with proper counters (`01 / 06`), image dimensions, next/previous controls, and enquiry routing.
* **Search Indexing & Title Fallback Corrections**: Fixed design search fallback from hardcoded `'Kitchen Design '` to dynamic `${label} Design ${id}` and indexed Balcony elements and galleries.
* **BFCache Restoration Cleanup**: Added `searchPanel` reset in `navigation.js` `pageshow` listener to prevent stale open panels on back/forward navigation.
* **Outdated Copy & Developer Scaffolding Replacement**: Updated `about.html` and `terms-policies.html` with professional, client-ready content on bespoke showcases, quotations, and lifetime warranties.
* **Footer Navigation Completion**: Added the missing "Balcony" collection link across all 10 HTML pages and footer templates.

### 2. Desktop Hover & Tactile Click Micro-Interactions
* Guarded by `@media (min-width: 769px) and (hover: hover)`:
  * **Search Toggle**: Smooth micro-scale and rotation (`scale(1.16) rotate(-3deg)`) on hover with tactile click compression (`scale(0.9)`).
  * **Search Close Button**: Subtle lift and accent color transition with active click feedback.
  * **Search Results**: Smooth horizontal glide (`padding-left: 14px`) with subtle translucent highlight and responsive badge movement.
  * **Menu Toggle & Drawer**: Staggered bar animation on hover and rotational spin on close button.
  * **Primary Navigation**: Upward float with graceful opacity easing.
  * **Gallery & Action Controls**: Elevating hover states with shadow blooms across filter pills, lightbox arrows, and CTA buttons.
  * **WhatsApp Floating Button**: Soft lift and vibrant glow shadow.
  * **Accessibility**: Includes full `@media (prefers-reduced-motion: reduce)` fallbacks.

### 3. Zero-VPS Google Sheets Backend Integration
* Connected all enquiry forms directly to a private Google Apps Script receiver:
  * **Live Receiver URL**: Configured in `enquiry-config.js`.
  * **Private Spreadsheet**: [FEALITY ITALY — Customer Enquiries](https://docs.google.com/spreadsheets/d/1M3_LMnj0-3dtxyK9hlHR8n2yyp3U4vtr3IkZjEhxU4c/edit)
  * **Instant Email Alerts**: Sent to `sksarfarajali824@gmail.com` with customer name, phone, city, collection, and message.
  * **Security**: Formula injection protection, honeypot spam bot trapping, and duplicate submission prevention.

---

## Live Lead Management & Excel Download

All customer enquiries submitted on the website appear instantly in your Google Spreadsheet:

1. Open the private Google Sheet: [FEALITY ITALY — Customer Enquiries](https://docs.google.com/spreadsheets/d/1M3_LMnj0-3dtxyK9hlHR8n2yyp3U4vtr3IkZjEhxU4c/edit)
2. View, search, or filter leads by Date, Collection, Customer Name, Phone, or City.
3. Update the **Follow-up status** column (`New` ➔ `Contacted` ➔ `Closed`).
4. **Download as Excel / CSV anytime**:
   * Click **`File → Download → Microsoft Excel (.xlsx)`**
   * Or click **`File → Download → Comma Separated Values (.csv)`**
5. **Mobile Access**: Download the free Google Sheets app on iOS or Android to manage enquiries directly from your smartphone.

---

## Deployment & Free Hosting

Because this project is 100% static, it requires no VPS, no Node.js runtime, and no backend server:

* **GitHub Pages (Currently Deployed)**:
  - Repository: `https://github.com/sarfaraj666/FEALITY-ITALY.git`
  - Live URL: `https://sarfaraj666.github.io/FEALITY-ITALY/`
  - Automatically updates whenever changes are pushed to `main`.
* **Other Free Static Hosts**:
  - Simply connect this repository to **Cloudflare Pages**, **Netlify**, or **Vercel** for free worldwide CDN hosting with automated SSL certificates.

---

## Project Structure

```
FEALITY-ITALY/
├── .gitignore            # Git exclusions
├── README.md             # Project documentation & setup instructions
├── enquiry-config.js     # Public client-side configuration (Google Sheet endpoint)
├── customer-enquiry.js   # Customer enquiry form handler
├── design-search.js      # Multi-collection search engine
├── hero-slider.js        # Interactive hero carousel controller
├── kitchen-gallery.js    # Gallery filter & enquiry modal controller
├── navigation.js         # Header navigation, drawer, & language toggle
├── styles.css            # Core luxury design system styles
├── collection-pages.css  # Collection-specific layout styles
├── client-refinements.css # Client visual refinements & desktop micro-interactions
├── index.html            # Home page & brand showcase
├── kitchen.html          # Kitchen collection page
├── wardrobes.html        # Wardrobes collection page
├── vanity.html           # Vanity collection page
├── balcony.html          # Balcony collection page
├── about.html            # About brand & craftsmanship page
├── contact.html          # Direct contact & showroom enquiry page
├── own-a-feality-studio.html # Studio franchise & partnership page
├── faqs.html             # Customer frequently asked questions
├── terms-policies.html   # Privacy, terms, and warranties
├── enquiry-backend/      # Google Apps Script source files (Code.gs & Catalogue.gs)
├── tools/                # Static templating utilities (render-footer.cjs)
└── assets/               # High-resolution imagery, fonts, and brand assets
```

---

## License & Attribution

Copyright &copy; 2026 **FEALITY ITALY**. All rights reserved.  
Crafted for bespoke luxury interior architecture.
