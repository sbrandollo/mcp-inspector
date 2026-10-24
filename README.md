# MCP Tool Explorer

A lightweight web app that shows you which tools a remote [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server exposes. Paste a server URL, add any headers it needs, and browse its tools with their descriptions and input schemas.

It is read-only and HTTP-only: it lists tools and nothing more.

## How it compares to the official MCP Inspector

The official [MCP Inspector](https://github.com/modelcontextprotocol/inspector) (`npx @modelcontextprotocol/inspector`) is a full debugger. Use it if you need anything beyond a tool listing.

|                              | MCP Tool Explorer          | Official MCP Inspector  |
| ---------------------------- | -------------------------- | ----------------------- |
| List tools                   | Yes                        | Yes                     |
| Call tools                   | No                         | Yes                     |
| Resources and prompts        | No                         | Yes                     |
| Transports                   | HTTP (JSON or SSE replies) | stdio, SSE, HTTP        |
| Custom request headers       | Yes                        | Yes                     |

MCP Tool Explorer is for a quick look at what a remote server offers, with as little setup as possible.

## Quick start

Requires **Node.js 22.23.4+, 24.22.1+, or 26.12.1+**. The server is written in TypeScript and runs on Node's built-in type stripping.

Earlier releases, including the end-of-life 23.x and 25.x lines, are not supported. They bundle a Brotli decoder affected by [CVE-2026-111497](https://nvd.nist.gov/vuln/detail/CVE-2026-111497). The proxy decompresses responses from whatever server you point it at, so a malicious server could exploit that decoder. Check your version with `node --version`.

```bash
git clone https://github.com/sbrandollo/mcp-inspector.git
cd mcp-inspector
npm install
npm run dev
```

Open <http://localhost:3000>. No environment variables or API keys are needed.

To run the production build:

```bash
npm run build
npm start
```

The server listens on port 3000 by default. Set `PORT` to change it:

```bash
PORT=8080 npm run dev
```

> **Windows:** `npm start` sets `NODE_ENV` using POSIX shell syntax, which fails in `cmd` and PowerShell. Use Git Bash or WSL, or run the server directly in PowerShell:
>
> ```powershell
> npm run build
> $env:NODE_ENV="production"; node server.ts
> ```

## Usage

1. **Enter the server URL**, for example `https://example.com/mcp`, and click **Fetch Tools**.
2. **Add headers if the server needs them.** Open **Advanced** and add a request header. For a server that uses bearer tokens, add `Authorization` with the value `Bearer <your-token>`. Headers are sent on every request to the server. They are not saved, so you have to add them again after reloading the page.
3. **Reuse recent servers.** The last 10 URLs that returned tools are stored in your browser's local storage and shown as you type in the URL field. Hover over an entry and click × to remove it.
4. **Search the tools.** Once tools are listed, filter them by name or description. Each card shows the tool's name, description and number of input parameters. Hover over a card to see its full input schema.

## How it works

The browser cannot call most MCP servers directly because of CORS, so a small Express server proxies the requests:

```
 Browser                 MCP Tool Explorer server             MCP server
    |                              |                               |
    |  POST /api/mcp/list-tools    |                               |
    |  { url, headers }            |                               |
    |----------------------------->|  1. initialize                |
    |                              |------------------------------>|
    |                              |<------------------------------|
    |                              |     (mcp-session-id, if any)  |
    |                              |  2. notifications/initialized |
    |                              |------------------------------>|
    |                              |  3. tools/list                |
    |                              |------------------------------>|
    |                              |<------------------------------|
    |<-----------------------------|     JSON or SSE body          |
    |  tool list (JSON)            |                               |
```

- The client identifies itself as `MCP Tool Explorer` and requests protocol version `2024-11-05`.
- If the server returns an `mcp-session-id` header on `initialize`, it is sent with the following requests.
- `tools/list` replies can be plain JSON or an SSE-formatted body. For SSE, the first `data:` line is parsed as the response.
- If a step fails, the UI shows the HTTP status and the server's response body, and the server console logs each phase (`[MCP Proxy] Phase 1: initialize`, and so on). Together they show which step broke.

## Security

**Do not expose this app on the public internet.** The proxy endpoint sends requests, with whatever headers it is given, to any URL it receives. Anyone who can reach it can use it to make requests from your machine or network, including to internal services. Run it locally, or behind authentication if you host it.

## Limitations

- Lists tools only. It cannot call tools or browse resources or prompts.
- HTTP only. There is no stdio transport.
- Always requests protocol version `2024-11-05` and does not negotiate other versions.
- Reads only the first page of `tools/list`. Pagination cursors are ignored.
- For SSE replies, only the first `data:` line is used.
- Authentication is limited to headers you add by hand. There is no OAuth flow.

## License

[MIT](LICENSE) © 2026 Christian Rizza
