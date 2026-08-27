# 🌐 Aksh AI Browser

> **Next-Generation Chromium-Class Intelligent Web Browser with In-Situ Gemini 3.7 AI Co-Pilot, Autonomous Deep Research Engine, PDF Document Intelligence & Knowledge Base**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Gemini-3.7%20Flash-8e75ff.svg)](https://deepmind.google/technologies/gemini/)
[![Motion](https://img.shields.io/badge/Motion-12.0-ff4154.svg)](https://motion.dev/)

---

## 📑 Table of Contents
1. [Overview](#-overview)
2. [End-to-End System Workflow](#-end-to-end-system-workflow)
3. [Architecture & Dataflow Diagram](#-architecture--dataflow-diagram)
4. [Core Features & Modules](#-core-features--modules)
   - [1. Real-Time Web Scraping & Multi-Tab Browsing](#1-real-time-web-scraping--multi-tab-browsing)
   - [2. In-Situ AI Co-Pilot (Gemini 3.7 Flash)](#2-in-situ-ai-co-pilot-gemini-37-flash)
   - [3. Autonomous Multi-Source Deep Research Engine](#3-autonomous-multi-source-deep-research-engine)
   - [4. PDF Document Intelligence & Study Quizzes](#4-pdf-document-intelligence--study-quizzes)
   - [5. AI Product Comparison & Decision Matrix](#5-ai-product-comparison--decision-matrix)
   - [6. AI Knowledge Base & Markdown Notes](#6-ai-notes--knowledge-base)
5. [Custom URL Protocol Scheme (`aksh://`)](#-custom-url-protocol-scheme-aksh)
6. [Keyboard Shortcuts](#-keyboard-shortcuts)
7. [Tech Stack & Engineering Design](#-tech-stack--engineering-design)
8. [Directory Structure](#-directory-structure)
9. [API Endpoints](#-api-endpoints)
10. [Getting Started & Local Development](#-getting-started--local-development)

---

## 🌟 Overview

**Aksh AI Browser** is a full-stack, browser-in-browser platform designed to reinvent how humans read, research, digest, and store knowledge across the web. Built on a modular React 19 and Express architecture, it pairs Chromium-grade browsing controls (tabs, omnibox, bookmarks, download manager, history, reader mode) with an embedded **Google Gemini 3.7 Flash** engine.

Unlike traditional AI extensions that sit disconnected from the active page, Aksh AI actively extracts clean DOM text, parses PDF streams, performs grounded multi-source research across the web, generates study quizzes, and manages persistent markdown notes in an all-in-one desktop experience.

---

## 🔄 End-to-End System Workflow

The Aksh AI Browser operates through a 5-stage closed-loop knowledge discovery cycle:

```
 ┌────────────────────────────────────────────────────────────────────────────┐
 │                     STAGE 1: LIVE PROXY & MULTI-TAB NAVIGATION             │
 │  • Omnibox navigation / Google search / Speed dial presets                 │
 │  • Express Backend fetches remote HTML via sub-100ms proxy pipeline        │
 │  • HTML sanitization & DOM readability text extraction                     │
 └─────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
 ┌────────────────────────────────────────────────────────────────────────────┐
 │                     STAGE 2: IN-SITU PAGE INTELLIGENCE                     │
 │  • Aksh AI Co-Pilot attaches active page context                           │
 │  • Generates 4 Synthesis Modes: Executive Brief, Key Takeaways,            │
 │    Action Checklist, and 30-second TL;DR                                   │
 └─────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
 ┌────────────────────────────────────────────────────────────────────────────┐
 │                     STAGE 3: AUTONOMOUS DEEP RESEARCH                      │
 │  • Multi-query decomposition & parallel web retrieval                      │
 │  • Source grounding with citation links & structured synthesis             │
 │  • Side-by-side product comparisons with weighted recommendation matrix    │
 └─────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
 ┌────────────────────────────────────────────────────────────────────────────┐
 │                     STAGE 4: PDF & DOCUMENT INTELLIGENCE                   │
 │  • In-browser PDF text reader with full-text keyword search                │
 │  • Section-by-section AI analysis & auto-generated study quizzes           │
 └─────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
 ┌────────────────────────────────────────────────────────────────────────────┐
 │                     STAGE 5: KNOWLEDGE RETENTION & EXPORT                  │
 │  • 1-Click Save as Note into Markdown Knowledge Base                       │
 │  • Local `.md` and `.json` file exports                                    │
 │  • Persistent bookmark tagging & download history tracking                 │
 └────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture & Dataflow Diagram

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT (React 19 + Vite)                             |
|                                                                                         |
|  +-----------------+  +-------------------+  +-------------------+  +----------------+  |
|  |    TitleBar     |  |    AddressBar     |  |   BookmarksBar    |  |  ShortcutsModal|  |
|  +-----------------+  +-------------------+  +-------------------+  +----------------+  |
|                                                                                         |
|  +-------------------------------------------------------------+  +------------------+  |
|  |                       ACTIVE VIEWPORT                       |  |  AKSH AI SIDEBAR |  |
|  |  * LiveWebView (Reader mode / iframe proxy / quick summary) |  |  * Gemini 3.7    |  |
|  |  * PDFViewer (Doc reader / study quiz / jump to section)    |  |  * Page Context  |  |
|  |  * ResearchMode (5-stage deep search & citations)          |  |  * 4 Summ Modes  |  |
|  |  * ProductComparisonView (Specs & benchmark matrix)         |  |  * Action Items  |  |
|  |  * AINotesView / Bookmarks / History / Downloads / Settings |  |  * Export Notes  |  |
|  +-------------------------------------------------------------+  +------------------+  |
+--------------------------------------------▲--------------------------------------------+
                                             │ HTTP REST / JSON
                                             ▼
+-----------------------------------------------------------------------------------------+
|                                  EXPRESS SERVER (server.ts)                             |
|                                                                                         |
|  +---------------------+  +----------------------+  +--------------------------------+  |
|  |   /api/scrape       |  |  /api/ai/chat        |  |  /api/ai/research              |  |
|  |   * Live Web Proxy  |  |  * Gemini 3.7 Flash  |  |  * Multi-Source Search Engine  |  |
|  |   * CORS Bypassing  |  |  * Context Embedding |  |  * Grounded Web Synthesis      |  |
|  |   * HTML Extraction |  |  * Markdown Delivery |  |  * Citation Linking            |  |
|  +---------------------+  +----------------------+  +--------------------------------+  |
|  +---------------------+  +----------------------+                                      |
|  |   /api/ai/summarize |  |  /api/ai/compare     |                                      |
|  |   * 4 Preset Modes  |  |  * Decision Matrix   |                                      |
|  +---------------------+  +----------------------+                                      |
+--------------------------------------------▲--------------------------------------------+
                                             │ @google/genai SDK
                                             ▼
                             +-------------------------------+
                             |    GOOGLE GENAI / GEMINI API  |
                             |      (Gemini 3.7 Flash)       |
                             +-------------------------------+
```

---

## ⚡ Core Features & Modules

### 1. Real-Time Web Scraping & Multi-Tab Browsing
- **Full Chromium Controls**: Back, Forward, Reload, Home, Pin Tab, Close Tab, Audio Mute, and Reader Mode.
- **Sub-100ms Proxy Pipeline**: Secure backend proxy (`/api/scrape`) bypasses cross-origin `X-Frame-Options` and `CSP` restrictions while sanitizing scripts and extracting clean DOM text.
- **Smart Reader View**: Distraction-free typography view that strips away ads, sidebars, and popups for clean reading.

### 2. In-Situ AI Co-Pilot (Gemini 3.7 Flash)
- **Automatic Page Binding**: The AI sidebar instantly receives the sanitized text of whatever page or PDF is active in the current tab.
- **4 Instant Summarization Modes**:
  1. **Executive Brief**: Comprehensive multi-paragraph strategic summary.
  2. **Key Takeaways**: High-signal bulleted core points.
  3. **Action Checklist**: Concrete next steps and actionable tasks.
  4. **TL;DR**: 30-second rapid overview for quick scanning.
- **Interactive Chat**: Ask follow-up questions, request explanations, or generate code based directly on the webpage content.

### 3. Autonomous Multi-Source Deep Research Engine
- Accessible via `aksh://research` or omnibox queries.
- **5-Stage Pipeline Progression**:
  1. *Decomposing Query into Sub-Searches*
  2. *Retrieving Live Web Sources & Citations*
  3. *Analyzing Perspectives & Cross-Validating Facts*
  4. *Synthesizing Structured Intelligence Report*
  5. *Finalizing Grounded Citations & Key Findings*
- Generates structured markdown reports with source citations, comparison tables, and direct 1-click **Save to Notes** or **Download as .md**.

### 4. PDF Document Intelligence & Study Quizzes
- Accessible via `aksh://pdf/<document-id>`.
- **Integrated PDF Reader**: Clean typography with pagination, zoom controls, keyword search, and section navigation.
- **Interactive Quiz Generator**: Automatically converts complex research papers (e.g., the Transformer *"Attention Is All You Need"* paper) into multiple-choice self-quizzes with instant scoring, feedback, and explanations.

### 5. AI Product Comparison & Decision Matrix
- Accessible via `aksh://comparison`.
- Side-by-side comparison of tech products (e.g., MacBook Pro M3 vs Dell XPS 15 vs ThinkPad X1 Carbon).
- Multi-category benchmark scoring across Display, Performance, Battery, Portability, and Value-for-Money with weighted verdict recommendations.

### 6. AI Notes & Knowledge Base
- Accessible via `aksh://notes`.
- Central repository for all saved AI summaries, deep research dossiers, and PDF insights.
- Full markdown rendering, instant tag filtering, search, and one-click `.md` / `.json` export.

---

## 🧭 Custom URL Protocol Scheme (`aksh://`)

Aksh AI Browser features internal protocol routing for native browser tools:

| URL Scheme | Target View | Description |
| :--- | :--- | :--- |
| `aksh://newtab` | **New Tab Homepage** | Speed dial, search bar, and interactive workflow pipeline |
| `aksh://research` | **Deep Research Mode** | Autonomous multi-source AI research engine |
| `aksh://pdf` | **PDF Intelligence** | In-browser document viewer, section parser & AI quiz |
| `aksh://notes` | **AI Knowledge Base** | Saved summaries, research dossiers & markdown exporter |
| `aksh://comparison` | **Decision Matrix** | Side-by-side product benchmark comparison |
| `aksh://history` | **Browsing History** | Chronological timeline of visited URLs |
| `aksh://bookmarks` | **Bookmarks Manager**| Tagged folders, custom URLs & JSON export |
| `aksh://downloads` | **Downloads Manager**| File download tracker with progress bars |
| `aksh://settings` | **Browser Settings** | AI configuration, theme, search engine & keyboard shortcuts |

*(Note: Legacy `nexus://` protocol queries are automatically aliased to `aksh://` for backwards compatibility).*

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + K` / `⌘ + K` | **Toggle AI Sidebar** | Open or collapse the Aksh AI Co-Pilot |
| `Ctrl + T` / `⌘ + T` | **New Tab** | Open a new tab (`aksh://newtab`) |
| `Ctrl + W` / `⌘ + W` | **Close Active Tab** | Close the currently selected tab |
| `Ctrl + R` / `⌘ + R` | **Reload Page** | Refresh current webpage or reader view |
| `Ctrl + H` / `⌘ + H` | **Open History** | Navigate directly to `aksh://history` |
| `Ctrl + B` / `⌘ + B` | **Open Bookmarks** | Navigate directly to `aksh://bookmarks` |
| `Ctrl + P` / `⌘ + P` | **Save Bookmark** | Toggle bookmark status for current tab |
| `?` (outside input) | **Shortcuts Modal** | Display full keyboard shortcuts cheat sheet |

---

## 🛠️ Tech Stack & Engineering Design

- **Frontend**: React 19, TypeScript 5.8, Tailwind CSS v4, Motion (framer-motion v12), Lucide Icons, Canvas Confetti.
- **Markdown & Code Rendering**: `react-markdown` with syntax highlighting and responsive tables.
- **Backend & Proxy**: Node.js, Express 4.21, `tsx` runtime engine, `esbuild` production bundler.
- **AI Intelligence**: `@google/genai` TypeScript SDK invoking **Gemini 3.7 Flash** with server-side API key protection.
- **Security**: Strict server-side proxy architecture ensuring API keys and secrets never reach the browser client.

---

## 📁 Directory Structure

```
aksh-ai-browser/
├── server.ts                       # Express backend: proxy scraper & Gemini 3.7 endpoints
├── metadata.json                   # App capabilities & configuration
├── package.json                    # Project manifest & build scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite + Tailwind v4 plugin config
├── src/
│   ├── main.tsx                    # React application root entry point
│   ├── App.tsx                     # Main browser shell, tab manager & layout
│   ├── types.ts                    # Global TypeScript interfaces & schemas
│   ├── index.css                   # Global Tailwind CSS imports
│   ├── data/
│   │   └── mockWebsites.ts         # Preloaded sites, sample PDFs & speed dials
│   ├── services/
│   │   └── api.ts                  # Frontend API client for AI & scraping
│   └── components/
│       ├── AI/
│       │   ├── AISidebar.tsx       # Co-pilot sidebar, prompt chips & tools
│       │   └── AIMessageItem.tsx   # Markdown chat bubbles & action buttons
│       ├── Browser/
│       │   ├── TitleBar.tsx        # Window controls, tabs & minimize/maximize
│       │   ├── TabBar.tsx          # Multi-tab strip with favicon, loading & pin
│       │   ├── AddressBar.tsx      # Omnibox, navigation buttons & reader toggle
│       │   └── BookmarksBar.tsx    # Quick bookmark buttons & manager link
│       ├── Modals/
│       │   └── KeyboardShortcutsModal.tsx # Keyboard shortcuts overlay
│       └── Views/
│           ├── NewTab.tsx          # Animated workflow tour, search & speed dial
│           ├── LiveWebView.tsx     # Web page viewport, reader mode & proxy
│           ├── ResearchMode.tsx    # 5-stage deep research engine & report generator
│           ├── PDFViewer.tsx       # In-browser PDF document reader & quiz system
│           ├── ProductComparisonView.tsx # Side-by-side benchmark decision matrix
│           ├── AINotesView.tsx     # Markdown knowledge base & file exporter
│           ├── BookmarksView.tsx   # Bookmark folders & JSON exporter
│           ├── HistoryView.tsx     # Chronological browsing history
│           ├── DownloadsView.tsx   # File downloads manager & simulation
│           └── SettingsView.tsx    # AI and browser preferences
```

---

## 📡 API Endpoints

### 1. `POST /api/scrape`
Proxies and sanitizes web pages to extract clean readability text.
- **Payload**: `{ "url": "https://example.com" }`
- **Response**: `{ "title": "...", "content": "...", "textContent": "..." }`

### 2. `POST /api/ai/chat`
Conversational AI co-pilot with active webpage / PDF context grounding.
- **Payload**: `{ "message": "...", "pageContext": "...", "chatHistory": [...] }`
- **Response**: `{ "response": "Markdown response from Gemini 3.7" }`

### 3. `POST /api/ai/summarize`
Preset summarization modes (executive, takeaways, action_items, tldr).
- **Payload**: `{ "content": "...", "title": "...", "mode": "takeaways" }`
- **Response**: `{ "summary": "...", "mode": "takeaways" }`

### 4. `POST /api/ai/research`
Autonomous deep research pipeline with live citation synthesis.
- **Payload**: `{ "query": "Best Python courses 2026", "depth": "deep" }`
- **Response**: `{ "report": { "summary": "...", "sources": [...] } }`

### 5. `POST /api/ai/compare`
Side-by-side product comparison and weighted benchmark scoring.
- **Payload**: `{ "products": ["MacBook Pro", "Dell XPS 15"], "aspects": [...] }`
- **Response**: `{ "comparison": "...", "verdict": "..." }`

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js 18+ or Bun
- A Google Gemini API Key (`GEMINI_API_KEY`)

### Setup Instructions

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file at the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🛡️ License & Credits

Built with precision using **Google Gemini 3.7 Flash**, **React 19**, **Tailwind CSS**, and **Express**.
Designed for researchers, developers, students, and power users navigating the modern web.
