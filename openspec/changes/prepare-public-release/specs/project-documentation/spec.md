# Spec Delta

## Purpose

Ensures a public user can understand what MCP Tool Explorer is, run it, use it safely, and know their rights to reuse it, from the repository's README and LICENSE alone.

## ADDED Requirements

### Requirement: README explains what the tool is and how it differs from the official inspector
The README SHALL describe MCP Tool Explorer as a lightweight, read-only viewer of the tools exposed by remote HTTP MCP servers, and SHALL link to the official `@modelcontextprotocol/inspector` for capabilities it does not provide.

#### Scenario: New visitor
- **WHEN** a visitor reads the opening of the README
- **THEN** they learn what the tool does, that it only lists tools over HTTP, and where to find the official inspector for calling tools, resources, prompts, or stdio servers

### Requirement: README quick start matches the actual commands
The README SHALL give install, development, and production commands that work as written, and SHALL state the supported Node.js versions (22.23.4+, 24.22.1+, 26.12.1+) and that older releases are excluded because of CVE-2026-111497.

#### Scenario: Following the quick start
- **WHEN** a user on a supported Node.js version follows the README quick start on a fresh clone
- **THEN** the application runs without undocumented steps or environment variables

#### Scenario: Vulnerable runtime
- **WHEN** a user on Node.js 24.19.0 reads the quick start
- **THEN** they learn their version is not supported and which version to upgrade to

#### Scenario: Port override documented
- **WHEN** a user reads the quick start
- **THEN** it explains that the port defaults to 3000 and can be changed with `PORT`

### Requirement: README documents usage
The README SHALL explain how to enter a server URL, add custom request headers (for example for authentication), reuse recent servers, and search the listed tools.

#### Scenario: Authenticated server
- **WHEN** a user needs to explore a server that requires a bearer token
- **THEN** the README tells them to add it as a custom header

### Requirement: README explains how it works
The README SHALL describe the request flow: the browser calls the local proxy, which performs `initialize`, `notifications/initialized`, and `tools/list` against the server, carries the session ID, and accepts JSON or SSE-formatted responses.

#### Scenario: Debugging a failing server
- **WHEN** a user's server fails to list tools
- **THEN** the README gives them enough of the request flow to tell which step failed

### Requirement: README warns about exposing the proxy
The README SHALL warn that the proxy forwards requests, with any headers, to any URL it is given, and that the application is meant to run locally or behind access control, not exposed publicly.

#### Scenario: Considering deployment
- **WHEN** a user considers hosting the application on a public server
- **THEN** the README tells them about the open-proxy risk before they do

### Requirement: README lists limitations
The README SHALL list what the tool does not do: call tools, browse resources or prompts, connect over stdio, or negotiate protocol versions other than the one it requests.

#### Scenario: Missing feature
- **WHEN** a user looks for tool-calling support
- **THEN** the README states it is not supported

### Requirement: Project is MIT licensed
The repository SHALL include an MIT `LICENSE` file with the copyright line "Copyright (c) 2026 Christian Rizza", and the README SHALL name the license.

#### Scenario: Checking reuse rights
- **WHEN** a user checks whether they may fork or reuse the project
- **THEN** the repository root contains the MIT license with that copyright line and the README refers to it
