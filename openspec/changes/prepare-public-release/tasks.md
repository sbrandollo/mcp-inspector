# Tasks

## 1. Rename to MCP Tool Explorer

- [x] 1.1 Set `package.json` `name` to `mcp-tool-explorer` and the `index.html` `<title>` to `MCP Tool Explorer`; verify the browser tab title in `npm run dev`
- [x] 1.2 Change the header in `src/App.tsx` to `MCP Tool Explorer`; verify the page header in `npm run dev`
- [x] 1.3 In `server.ts`, set `clientInfo.name` to `MCP Tool Explorer` and `User-Agent` to `MCP-Tool-Explorer/1.0`, and reword the "Magento server style" SSE comment to describe SSE-formatted responses generically; verify the `[MCP Proxy]` logs still appear and `grep -rn "MCP-Inspector\|MCP Inspector\|react-example\|AI Studio App" --exclude-dir=node_modules --exclude-dir=openspec .` returns nothing

## 2. Remove unused Gemini and AI Studio configuration

- [x] 2.1 Remove `@google/genai` from `package.json` and run `npm install`; verify it succeeds and `@google/genai` no longer appears in `package-lock.json` (if present)
- [x] 2.2 Remove the `GEMINI_API_KEY` `define` from `vite.config.ts` and reword the AI Studio HMR comment, keeping the `@` alias and `DISABLE_HMR` behavior; verify `npm run build` succeeds
- [x] 2.3 Delete `.env.example` and the `!.env.example` line in `.gitignore`; verify `grep -rn "GEMINI\|APP_URL" --exclude-dir=node_modules --exclude-dir=openspec .` returns nothing and the app starts with no env file

## 3. Make the UI describe only what the app does

- [x] 3.1 Reword the intro text in `src/App.tsx` to describe discovering tools, with no mention of testing; verify the rendered copy
- [x] 3.2 Remove the hardcoded `auth: none` badge from tool cards, keeping name, description or placeholder, parameter count, and schema on hover; verify against a server whose tool declares three input properties that the card shows `params: 3` and no auth badge
- [x] 3.3 Replace the `MCP SPEC V1.2.0` footer text with protocol version `2024-11-05` and point the GitHub link at `https://github.com/sbrandollo/mcp-inspector`; verify the footer text and that the link opens the repo

## 4. Fix runtime and packaging

- [x] 4.1 Read the port from `Number(process.env.PORT) || 3000` in `server.ts`, including the startup log; verify the server listens on 3000 by default and on 8080 with `PORT=8080 npm run dev`
- [x] 4.2 Change the `start` script to `NODE_ENV=production node server.ts` and add `"engines": { "node": ">=22.18" }` to `package.json`; verify `npm run build && npm start` serves the built assets (no Vite dev middleware in the logs) and that a request to a non-API path such as `/anything` returns `index.html`
- [x] 4.3 Narrow `engines.node` in `package.json` to `^22.23.4 || ^24.22.1 || >=26.12.1` (CVE-2026-111497); verify with `npx semver` that 24.19.0, 23.11.0 and 25.0.0 fall outside the range and 22.23.4, 24.22.1 and 26.12.1 fall inside

## 5. Add license and README

- [x] 5.1 Add an MIT `LICENSE` at the repository root with `Copyright (c) 2026 Christian Rizza`; verify the text matches the standard MIT license
- [x] 5.2 Rewrite `README.md` per the project-documentation spec: pitch and comparison with `@modelcontextprotocol/inspector`, quick start (Node.js >= 22.18, `npm install`, `npm run dev`, `npm run build && npm start`, `PORT`, and a note for Windows shells without POSIX env syntax), usage (URL, custom headers for auth, recent servers, tool search), how it works (request-flow diagram of `initialize`, `notifications/initialized`, `tools/list`, session ID, JSON/SSE responses), security warning about the open proxy, limitations, and license; verify every requirement in `specs/project-documentation/spec.md` is covered
- [x] 5.3 Update the README quick start to state the supported Node.js versions (22.23.4+, 24.22.1+, 26.12.1+) and that older releases are excluded because of CVE-2026-111497; verify it matches `engines` in `package.json` and that `grep -n "22\.18" README.md package.json` returns nothing

## 6. Integration checks

- [x] 6.1 Run `npm run lint` and `npm run build`; verify both succeed with no errors
- [ ] 6.2 On a fresh clone with no env file, follow the README quick start word for word and list tools from a reachable HTTP MCP server, once with a custom `Authorization` header; verify the tools appear, the URL is added to recent servers, and no undocumented step was needed
- [x] 6.3 Run `openspec validate prepare-public-release --strict`; verify the change is valid

## Workflow follow-up

- Archive the change with `/opsx:archive` once the work is reviewed, which syncs the three new capabilities into `openspec/specs/`.
