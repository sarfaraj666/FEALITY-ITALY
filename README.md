# FEALITY ITALY — Luxury Italian Living & Kitchen Systems

Official web platform for **FEALITY ITALY**, showcasing modular Italian kitchens, wardrobes, vanities, and balconies, complete with a secure customer enquiry pipeline, local MySQL database integration, and an administrative dashboard for managing and exporting leads.

---

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [What Has Been Done (Changelog & Milestones)](#what-has-been-done-changelog--milestones)
   - [UI & Frontend Bug Fixes](#1-ui--frontend-bug-fixes)
   - [MySQL Database & phpMyAdmin Integration](#2-mysql-database--phpmyadmin-integration)
   - [Admin Portal Dashboard](#3-admin-portal-dashboard)
   - [Security Hardening & Environment Isolation](#4-security-hardening--environment-isolation)
3. [Setup & Installation](#setup--installation)
4. [Environment Configuration (`.env`)](#environment-configuration-env)
5. [Running the Application](#running-the-application)
6. [Admin Portal Guide](#admin-portal-guide)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Project Structure](#project-structure)

---

## Overview & Architecture

FEALITY ITALY delivers an editorial design experience for luxury interiors. The platform features:
* **Frontend**: Responsive, modern semantic HTML5, CSS3 with luxury typography and micro-interactions, vanilla ES6+ client scripts.
* **Backend**: Node.js HTTP server (`server.js`) with native environment variable loading (`.env`).
* **Database**: MySQL 8.0 (`feality_italy` database with `enquiries` table), compatible with phpMyAdmin, paired with an automatic zero-loss SQLite local backup store (`data/enquiries.db`).
* **Admin Management**: Dedicated, password-protected administrative dashboard (`admin.html`) with live KPI metrics, search/filtering, modal customer inspection, lead status management, and instant CSV/Excel export.
* **Security**: Rate limiting, brute-force lockout, honeypot bot trap, timing-safe authentication, strict static file sandboxing, and security HTTP headers.

---

## What Has Been Done (Changelog & Milestones)

### 1. UI & Frontend Bug Fixes
* **Removal of Diagonal Arrow Glyphs (`↗`)**:
  * Removed obsolete unicode arrows across all 20 HTML pages, search result lists, gallery cards, and mobile menus for a clean, editorial look.
* **Luxury Glassmorphism Matte Finish on Quick Search**:
  * Styled `.search-panel` with satin translucent backdrop blur (`blur(28px) saturate(180%)`), subtle gradient borders, frosted input underlines, and matte result item states.
* **Unified Lightbox Navigation for Balcony Perspective Designs**:
  * Integrated perspective side designs (`FealityBalconySideDesigns`) with `kitchen-gallery.js` so clicking cards opens the exact design with its bespoke details, counter, Next/Previous controls, and enquiry handler, eliminating conflicting inline scripts.
* **Search Indexing & Title Fallback Corrections**:
  * Fixed design search fallback in `design-search.js` from hardcoded `'Kitchen Design '` to dynamic `label + ' Design ' + design.id`.
  * Indexed Balcony elements, galleries, and perspective side cards in both `navigation.js` and `design-search.js`.
* **BFCache Restoration Cleanup**:
  * Added `searchPanel` reset in `pageshow` listener in `navigation.js` to ensure the modal panel cleanly dismisses when navigating with browser back/forward buttons.
* **Outdated Copy & Developer Scaffolding Replacement**:
  * Updated `about.html` line 114 to point clients directly to the Contact & Enquiry page and phone concierge.
  * Replaced developer draft scaffolding on `terms-policies.html` with formal, production-grade policies on custom showcases, privacy, quotations, and lifetime warranties.
* **Script Cleanup & Dead Test Harness Removal**:
  * Removed duplicate enquiry scripts from `own-a-feality-studio.html`.
  * Removed inactive test harness links (`lead-enquiry.js` and `lead-enquiry.css`) from collection pages.
* **Missing Balcony Navigation in Footer**:
  * Added the missing "Balcony" collection link across all 10 HTML pages (`about.html`, `balcony.html`, `contact.html`, `faqs.html`, `index.html`, `kitchen.html`, `own-a-feality-studio.html`, `terms-policies.html`, `vanity.html`, `wardrobes.html`).
  * Updated the templating utility in `tools/render-footer.cjs`.
* **Interactive Kitchen Modal "Enquire Now"**:
  * Resolved an issue in `kitchen-gallery.js` where the modal enquiry button remained disabled or failed to redirect when viewing custom design cards. Added click delegation for balcony collections.
* **Multi-Collection Search Filtering**:
  * Fixed `design-search.js` on `index.html` to query across all 4 collections (Kitchen, Wardrobes, Vanity, Balcony) instead of limiting results to kitchens only.
* **Hero Slider Asset Path Case Sensitivity**:
  * Fixed case sensitivity in `hero-slider.js` from `assets/balcony/` to `assets/Balcony/` to prevent 404 image errors on case-sensitive file systems and servers.
* **Studio Partnership Enquiry & Anchor**:
  * Linked missing enquiry handlers and corrected anchor reference (`#studio-opportunity`) on `own-a-feality-studio.html`.
* **Language Switcher Usability**:
  * Replaced blocking browser `alert()` popups on the language toggle with a subtle, non-intrusive status indicator in `navigation.js`.
* **Search Bar Visual Collision**:
  * Suppressed the default WebKit clear `x` icon colliding with the custom search icon in `styles.css`.

---

### 2. MySQL Database & phpMyAdmin Integration
* **Local MySQL Instance Connection**:
  * Configured connection to local MySQL Server 8.0 on port `3306` (`127.0.0.1:3306`).
  * Created database `feality_italy` and table `enquiries` using `utf8mb4_unicode_ci`.
* **Connection Pooling with `mysql2`**:
  * Replaced SQLite-only storage with a high-performance `mysql2/promise` connection pool in `server.js`.
  * Enquiries submitted by customers are immediately inserted into MySQL and visible in phpMyAdmin under `feality_italy -> enquiries`.
* **Automatic SQLite Backup**:
  * Added dual-write redundancy using Node.js `node:sqlite`. If MySQL ever becomes unreachable or undergoes maintenance, submissions continue to save locally and zero lead data is lost.

#### MySQL Table Schema (`enquiries`):
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | Primary Key (UUID) |
| `reference` | `VARCHAR(64)` | Unique customer reference (`FE-...`) |
| `created_at` | `DATETIME` | Timestamp of enquiry |
| `name` | `VARCHAR(100)` | Customer's full name |
| `phone` | `VARCHAR(30)` | Contact phone number |
| `email` | `VARCHAR(160)` | Optional email address |
| `city` | `VARCHAR(100)` | City or region |
| `collection` | `VARCHAR(50)` | Product collection (Kitchen, Wardrobes, etc.) |
| `design_id` | `VARCHAR(50)` | Design identifier if selected |
| `message` | `TEXT` | Customer enquiry details / requirements |
| `budget` | `VARCHAR(50)` | Estimated budget |
| `source_page` | `VARCHAR(100)` | URL / HTML page where form was submitted |
| `status` | `VARCHAR(20)` | Workflow status (`New`, `Contacted`, `Closed`) |

---

### 3. Admin Portal Dashboard
* **Accessible at**: `http://localhost:3000/admin.html`
* **Features Built**:
  * **Password-Protected Authentication**: Secure login overlay connected to `.env` admin password.
  * **Live Metric Counters**: Instant overview of Total Enquiries, New Leads, Kitchens, Wardrobes, Vanities, Balconies, and Studio Partnerships.
  * **Search & Filters**: Real-time filtering by collection category, lead status, customer name, phone, city, or reference ID.
  * **Status Management**: Inline dropdown to switch statuses between `New`, `Contacted`, and `Closed` (updates MySQL immediately).
  * **Detailed Lead Inspection**: Modal popup displaying complete enquiry information, timestamps, customer message, and source page.
  * **Safe Lead Deletion**: Delete test or invalid leads with immediate database synchronization.
  * **CSV / Excel Export**: One-click download button (`/api/admin/export.csv`) delivering an Excel-compatible, UTF-8 BOM CSV export.

---

### 4. Security Hardening & Environment Isolation
* **Zero Hardcoded Credentials**:
  * Removed all fallback passwords, database credentials, and external webhook URLs from source files.
  * Externalized all configuration into `.env`.
* **Git Protection**:
  * `.gitignore` prevents `.env`, private keys (`*.key`, `*.pem`), and database storage files (`data/`, `*.db`) from being tracked or committed.
  * Provided `.env.example` as a clean deployment template.
* **Static File Sandboxing**:
  * Blocks directory traversal attacks (`../`).
  * Blocks access to dotfiles (`.env`, `.git`, `.gitignore`).
  * Blocks sensitive backend files and directories (`server.js`, `package.json`, `data/`, `tools/`, `enquiry-backend/`).
  * Enforces an explicit extension whitelist (`.html`, `.css`, `.js`, `.json`, `.webp`, `.png`, `.jpg`, `.svg`, `.woff2`).
* **Brute-Force & Anti-Spam Protection**:
  * **Admin Protection**: Limits failed admin password attempts to 5 per IP. Further attempts trigger an automatic 15-minute lockout (`HTTP 429`).
  * **Enquiry Rate Limiting**: Restricts enquiry submissions to 10 per minute per IP to prevent database spam.
  * **Timing-Safe Auth**: Uses `crypto.timingSafeEqual` with SHA-256 hashes to prevent side-channel timing attacks.
* **Bot Trap (Honeypot)**:
  * Customer forms include a hidden honeypot trap (`website`) that rejects automated bot submissions without affecting real users.
* **Security HTTP Headers**:
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: SAMEORIGIN`
  * `X-XSS-Protection: 1; mode=block`
  * `Referrer-Policy: strict-origin-when-cross-origin`
* **Safe Public Config API (`/api/config`)**:
  * Exposes only public contact numbers (`whatsapp`, `phone`, `email`) without exposing internal backend configuration.

---

## Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v20.6+ or v24 recommended)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) or XAMPP / phpMyAdmin

### 1. Clone the Repository
```bash
git clone https://github.com/sarfaraj666/FEALITY-ITALY.git
cd FEALITY-ITALY
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MySQL Database
1. Open phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL CLI.
2. Ensure MySQL is running on port `3306`.
3. Create a database named `feality_italy`:
   ```sql
   CREATE DATABASE IF NOT EXISTS feality_italy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(The server will automatically generate the `enquiries` table when started).*

---

## Environment Configuration (`.env`)

Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your actual settings:
```env
# Application Environment & Port
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=feality_italy

# Admin Portal Password (http://localhost:3000/admin.html)
ADMIN_PASSWORD=your_admin_password

# External Integrations (Optional Webhooks)
GOOGLE_SCRIPT_URL=

# Public Contact Information
CONTACT_EMAIL=sksarfarajali824@gmail.com
WHATSAPP_NUMBER=919832722644
PHONE_NUMBER=+919522251777
```

> **Important**: Never commit your `.env` file to Git. It is automatically ignored by `.gitignore`.

---

## Running the Application

Start the web server:
```bash
npm start
```
*or directly with Node:*
```bash
node server.js
```

The console will display:
```
====================================================
FEALITY ITALY Server running on http://localhost:3000
Admin Portal: http://localhost:3000/admin.html
Database: MySQL 'feality_italy' (Port 3306)
Security: Static sandbox active, .env protected, rate limiting enabled.
====================================================
[DB] Verified MySQL table 'enquiries' in 'feality_italy'
```

* **Main Website**: [http://localhost:3000](http://localhost:3000)
* **Admin Portal**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## Admin Portal Guide

1. Navigate to `http://localhost:3000/admin.html`.
2. Enter the `ADMIN_PASSWORD` defined in your `.env` file.
3. You will have full access to:
   * View all customer enquiries in reverse-chronological order.
   * Search by name, phone, city, or reference number.
   * Filter by collection (Kitchen, Wardrobes, Vanity, Balcony, Studio).
   * Update lead status (`New` ➔ `Contacted` ➔ `Closed`).
   * Click **View** on any row to open the complete customer message and details.
   * Click **Download CSV** to generate a clean, Excel-compatible export.

---

## API Endpoints Reference

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/config` | `GET` | No | Returns safe public contact settings (WhatsApp, phone, email). |
| `/api/enquiry` | `POST` | No (Rate-limited) | Submits customer enquiry, saves to MySQL, and mirrors externally. |
| `/api/admin/enquiries` | `GET` | Yes (`x-admin-key`) | Retrieves all enquiries from MySQL for the admin dashboard. |
| `/api/admin/enquiries/status` | `POST` | Yes (`x-admin-key`) | Updates enquiry status (`New`, `Contacted`, `Closed`). |
| `/api/admin/enquiries` | `DELETE` | Yes (`x-admin-key`) | Deletes an enquiry record by ID. |
| `/api/admin/export.csv` | `GET` | Yes (`?key=...`) | Exports all enquiries into a downloadable CSV file. |

---

## Project Structure

```
FEALITY-ITALY/
├── .env                  # Secret environment credentials (git-ignored)
├── .env.example          # Public environment configuration template
├── .gitignore            # Git exclusions
├── admin.html            # Admin management portal & lead dashboard
├── server.js             # Node.js backend server with MySQL integration
├── package.json          # Node dependencies & project metadata
├── README.md             # Project documentation & setup instructions
├── enquiry-config.js     # Public client-side configuration
├── customer-enquiry.js   # Customer enquiry form handler
├── design-search.js      # Multi-collection search engine
├── hero-slider.js        # Interactive hero carousel controller
├── kitchen-gallery.js    # Gallery filter & enquiry modal controller
├── navigation.js         # Header navigation, drawer, & language toggle
├── styles.css            # Core luxury design system styles
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
├── data/                 # Local backup directory (SQLite fallback)
└── assets/               # High-resolution imagery, fonts, and brand assets
```

---

## License & Attribution

Copyright &copy; 2026 **FEALITY ITALY**. All rights reserved.
Crafted for bespoke luxury interior architecture.
