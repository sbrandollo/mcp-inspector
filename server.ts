import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint to proxy MCP tool listing
  app.post("/api/mcp/list-tools", async (req, res) => {
    const { url, headers: customHeaders } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing MCP server URL" });
    }

    try {
      console.log(`[MCP Proxy] URL: ${url}`);
      
      const commonHeaders = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream, */*",
        "User-Agent": "MCP-Inspector/1.0",
        ...customHeaders
      };

      // 1. Initialize
      console.log("[MCP Proxy] Phase 1: initialize");
      const initResponse = await fetch(url, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "MCP-Inspector", version: "1.0.0" }
          },
        }),
      });

      if (!initResponse.ok) {
        const text = await initResponse.text();
        console.error(`[MCP Proxy] Init failed: ${initResponse.status}`, text);
        return res.status(initResponse.status).json({ error: `Initialization failed (${initResponse.status})`, details: text });
      }

      const sessionId = initResponse.headers.get("mcp-session-id");
      const sessionHeaders = { ...commonHeaders };
      if (sessionId) {
        (sessionHeaders as any)["mcp-session-id"] = sessionId;
        console.log(`[MCP Proxy] Session ID: ${sessionId}`);
      }

      // 2. Initialized Notification
      console.log("[MCP Proxy] Phase 2: initialized notification");
      await fetch(url, {
        method: "POST",
        headers: sessionHeaders,
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "notifications/initialized"
        }),
      });

      // 3. List Tools
      console.log("[MCP Proxy] Phase 3: tools/list");
      const toolsResponse = await fetch(url, {
        method: "POST",
        headers: sessionHeaders,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {},
        }),
      });

      let text = await toolsResponse.text();
      if (!toolsResponse.ok) {
        console.error(`[MCP Proxy] List tools failed: ${toolsResponse.status}`, text);
        return res.status(toolsResponse.status).json({ error: `List tools failed (${toolsResponse.status})`, details: text });
      }

      // Handle SSE-style output (Magento server style)
      // Check for 'data: ' prefix even if 'event: ' isn't at the very start
      if (text.includes("data: ")) {
        const lines = text.split(/\r?\n/);
        const dataLine = lines.find(l => l.trim().startsWith("data: "));
        if (dataLine) {
          text = dataLine.trim().slice(6).trim();
          console.log("[MCP Proxy] Extracted data from SSE stream");
        }
      }

      try {
        const data = JSON.parse(text);
        console.log("[MCP Proxy] Success");
        res.json(data);
      } catch (e) {
        console.error("[MCP Proxy] JSON Parse Error", e, "Raw text:", text.substring(0, 500));
        res.status(500).json({ 
          error: "Invalid JSON response from MCP server", 
          details: text 
        });
      }
    } catch (error: any) {
      console.error("MCP Proxy Error:", error);
      res.status(500).json({ 
        error: "Failed to connect to MCP server", 
        details: error.message 
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
