# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # Start development server with hot reload (nodemon)
npm start      # Start production server
```

No build step — frontend files in `public/` are served statically. No test or lint tooling configured.

## Architecture

This is an Express.js app (ES Modules, `type: "module"`) deployed on Vercel. All requests are routed through `server.js`, which serves static files from `public/` and proxies API calls to an external backend at `http://54.238.90.135:8080`.

### Two main features

**Q&A page** (`/`, `public/index.html` + `public/index.js`) — Redirects users to `/mermaid`. Originally a hurdle-running Q&A tool; currently defers to the diagram tool.

**Mermaid diagram generator** (`/mermaid`, `public/mermaid.html` + `public/mermaid.js`) — Users select a diagram type, fill in a templated prompt, and the AI returns Mermaid syntax. The client renders a live preview via Mermaid.js and can export as PNG via the Kroki API (https://kroki.io) using deflate + Base64 encoding.

### Request flow

```
Browser → server.js (Express)
  └── Static files: public/**
  └── /api/* → proxy to http://54.238.90.135:8080
```

Authentication uses JWT stored in `localStorage`. Every API call includes `Authorization: Bearer <token>`. The backend enforces a daily 10-call limit tracked in a PostgreSQL table (`sample1.api_call_log`).

### Key files

| File | Purpose |
|---|---|
| `server.js` | Express server; proxy routes to external backend |
| `db/connect.js` | PostgreSQL connection + API rate-limit helper |
| `public/app.js` | Re-exports `utils.js` and `data.js` for pages |
| `public/utils.js` | `logout()`, `checkMe()` (auth guard) |
| `public/data.js` | Diagram type options and sample prompt metadata |
| `public/mermaid.js` | Core diagram generation, rendering, and PNG download |
| `public/login.js` | Sign-up / login flows |
| `public/mypage.js` | Q&A history page |

### External dependencies (frontend, via CDN)

- **Mermaid.js v10** — diagram rendering (security level set to `'loose'`)
- **Marked.js** — Markdown parsing of AI responses
- **Kroki API** — converts Mermaid code to PNG for download
- **Meltline CSS** — utility CSS framework (jsdelivr CDN)

### Environment variables (`.env`, not committed)

```
OPENAI_API_KEY=...
PGHOST=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
```

The `.env` file is git-ignored. Obtain credentials from the team before running locally.
