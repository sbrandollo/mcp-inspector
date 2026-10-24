# Design

## Context

See proposal.md for motivation. The app is one Express server (`server.ts`) that hosts the proxy endpoint and either mounts Vite as middleware (development) or serves `dist/` (production), branching on `NODE_ENV`. The UI is a single React component (`src/App.tsx`). `server.ts` runs directly as TypeScript: Node.js strips types natively from 22.18, and `npm run dev` uses `tsx`. Nothing in the code reads `GEMINI_API_KEY` or `APP_URL`.

## Goals / Non-Goals

**Goals:**
- The README can describe every command and feature without caveats.
- Keep the diff small: no restructuring of `server.ts` or `App.tsx` beyond what the specs require.

**Non-Goals:**
- Splitting `App.tsx` into components, adding tests, or a CI setup.
- A compiled server build or Docker image.

## Decisions

**Production start: `NODE_ENV=production node server.ts`.**
Relies on native TypeScript execution, available in every supported Node.js version (see the runtime decision below). Alternatives: keep `tsx` at runtime (it would have to move from devDependencies to dependencies), or compile `server.ts` with `tsc`/esbuild into `dist/` (adds a build step and output layout to document). Native execution adds nothing and matches the documented Node minimum. The inline `NODE_ENV=...` prefix is POSIX-shell syntax. Windows users without a POSIX shell get a note in the README rather than a `cross-env` dependency; revisit if issues come in.

**Supported runtimes: `"engines": { "node": "^22.23.4 || ^24.22.1 || >=26.12.1" }`.**
The proxy calls `fetch()` on user-supplied URLs, and Node's `fetch` transparently decodes `Content-Encoding: br` with its bundled Brotli, which is affected by CVE-2026-111497 in earlier releases. A malicious MCP server, or anyone tampering with a plain `http://` connection, can therefore reach the vulnerable decoder. The open proxy lets anyone who can reach the endpoint aim it at such a server. The range names the first fixed release of each supported line and leaves out the end-of-life 23.x and 25.x. Alternative considered: sending `Accept-Encoding: identity` to avoid Brotli. Rejected as the primary fix, because servers may ignore it and the runtime stays vulnerable for any other decompression. `engines` only warns unless npm's `engine-strict` is set, so the README states the requirement and the reason too.

**Port: `Number(process.env.PORT) || 3000`.**
Standard convention for hosting platforms; nothing else reads the port.

**Remove `.env.example` entirely** rather than leaving an empty template. The app needs no configuration, and an env file template suggests otherwise. `.gitignore`'s `!.env.example` line goes with it.

**Remove the Gemini `define` from `vite.config.ts` and the `@google/genai` dependency.** The `@` path alias and the `DISABLE_HMR` handling stay. The HMR toggle is harmless, though its AI Studio comment is reworded.

**Footer protocol version as a shared literal.** `2024-11-05` appears in the proxy's `initialize` request. The footer shows the same value. A single shared constant across server and client isn't worth a module for one string, so both keep the literal and the README's "How it works" section names it once.

**Client identity strings.** `clientInfo.name` becomes `MCP Tool Explorer` and `User-Agent` becomes `MCP-Tool-Explorer/1.0`. The version stays `1.0.0`, matching the current client info, and is not tied to `package.json`.

**README structure:** title and one-line pitch, comparison with the official inspector, quick start, usage, how it works (with a small request-flow diagram), security note, limitations, license. A screenshot is welcome but not required by the specs.

## Risks / Trade-offs

- [Users on an older Node.js get a syntax error from `node server.ts`, or run a runtime affected by CVE-2026-111497] → State the supported versions and the reason in the README, and declare them in `engines`.
- [The fixed release numbers come from secondary write-ups, not the official Node.js advisory] → Confirm them against the Node.js October 2026 security release post before publishing. If they differ, only the `engines` range and the README line change.
- [Repository name `mcp-inspector` still differs from the product name] → Accepted for now; GitHub redirects if the repo is renamed later, and the footer/README links only need one update.
- [Removing `.env.example` breaks anyone who copied it] → Nothing reads those variables, so stale `.env` files are inert.
