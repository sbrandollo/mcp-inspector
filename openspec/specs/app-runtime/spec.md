# app-runtime Specification

## Purpose

Defines how the MCP Tool Explorer server starts and serves its UI in development and production, so that the documented commands behave as stated.

## Requirements

### Requirement: Development mode serves the UI with live reload
Running the development command SHALL start the server with the UI served from source with hot reloading, alongside the proxy API.

#### Scenario: Dev start
- **WHEN** the user runs `npm run dev`
- **THEN** the UI and the `/api/mcp/list-tools` endpoint are available on the configured port, served from source

### Requirement: Production start serves the built UI
Running the start command SHALL serve the previously built UI assets in production mode, alongside the proxy API, and SHALL NOT start the development server.

#### Scenario: Production start after build
- **WHEN** the user runs `npm run build` and then `npm start`
- **THEN** the server serves the built assets and the proxy API, without the development server

#### Scenario: Client-side routes
- **WHEN** a browser requests a non-API path in production mode
- **THEN** the server responds with the built `index.html`

### Requirement: Configurable listening port
The server SHALL listen on the port given by the `PORT` environment variable, and on port 3000 when `PORT` is not set.

#### Scenario: Default port
- **WHEN** the server starts without `PORT` set
- **THEN** it listens on port 3000

#### Scenario: Custom port
- **WHEN** the server starts with `PORT=8080`
- **THEN** it listens on port 8080

### Requirement: Supported runtimes exclude CVE-2026-111497
The package SHALL declare as supported only Node.js releases whose bundled Brotli decoder is fixed for CVE-2026-111497: 22.23.4 or later on 22.x, 24.22.1 or later on 24.x, and 26.12.1 or later.

#### Scenario: Affected runtime
- **WHEN** dependencies are installed on Node.js 24.19.0
- **THEN** npm reports the runtime as unsupported by the package's engine requirement

#### Scenario: End-of-life line
- **WHEN** dependencies are installed on Node.js 23.x or 25.x
- **THEN** npm reports the runtime as unsupported

#### Scenario: Fixed runtime
- **WHEN** dependencies are installed on Node.js 24.22.1
- **THEN** npm reports no engine mismatch

### Requirement: No environment configuration required
The application SHALL run with no environment variables or secrets configured.

#### Scenario: Fresh clone
- **WHEN** a user clones the repository, installs dependencies, and starts the server without creating any env file
- **THEN** the application starts and can list tools from an MCP server
