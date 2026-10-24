# Proposal

## Why

The project is about to be published for public, open-source use, but it still carries its AI Studio scaffold: a boilerplate README, four different names, an unused Gemini integration, a production start that actually serves the dev server, and UI text that claims features which do not exist. A public README can only be honest once the code it describes is, so the cleanup and the documentation ship together.

## What Changes

- Rename the project everywhere to **MCP Tool Explorer** (package name, page title, UI header, MCP client identity), avoiding a clash with the official `@modelcontextprotocol/inspector`.
- Remove the unused Gemini integration: the `@google/genai` dependency, the `GEMINI_API_KEY` define in the Vite config, and `.env.example` (no environment variables are required).
- Remove false UI claims: "test" wording (there is no tool calling), the hardcoded "auth: none" badge, and the invented "MCP SPEC V1.2.0" footer; show the real protocol version instead and point the GitHub link at the actual repository.
- Make `npm start` serve the production build (`NODE_ENV=production`), and read the listening port from `PORT`, defaulting to 3000.
- Declare only Node.js releases that fix CVE-2026-111497 as supported (22.23.4+, 24.22.1+, 26.12.1+). The proxy's `fetch` decompresses Brotli responses from user-supplied servers with Node's bundled, affected Brotli decoder.
- Replace the README with documentation for public users: what the tool is and how it differs from the official inspector, quick start, usage, how it works, a security note about the open proxy, limitations, and license.
- Add an MIT `LICENSE` (Copyright (c) 2026 Christian Rizza).

Out of scope: tool calling, resources/prompts, stdio transport, tests, renaming the GitHub repository or local folder.

## Capabilities

### New Capabilities
- `tool-discovery`: connecting to a remote HTTP MCP server through the local proxy and presenting its tools, including how the client identifies itself and what metadata the UI may claim.
- `app-runtime`: how the application server starts and serves the UI in development and production, including port configuration.
- `project-documentation`: the README and LICENSE a public user relies on to understand, run, and safely use the project.

### Modified Capabilities

None. No main specs exist yet.

## Impact

- Code: `src/App.tsx` (header, copy, tool card badges, footer), `server.ts` (client identity, `PORT`), `vite.config.ts` (Gemini define), `index.html` (title).
- Packaging: `package.json` (name, `start` script, `@google/genai` removed); `.env.example` deleted.
- Docs: `README.md` rewritten; `LICENSE` added; `metadata.json` already uses the new name.
- Users: supported Node.js versions are 22.23.4+ on 22.x, 24.22.1+ on 24.x, and 26.12.1+ (native TypeScript execution for `server.ts`, and fixed for CVE-2026-111497); 23.x and 25.x are excluded. Anyone relying on `npm start` serving the dev server must use `npm run dev`.
