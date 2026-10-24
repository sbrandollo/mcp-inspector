# tool-discovery Specification

## Purpose

Lets a user point MCP Tool Explorer at a remote HTTP MCP server and see the tools it exposes, with only accurate metadata shown about each tool and about the explorer itself.

## Requirements

### Requirement: List tools from a remote HTTP MCP server
The system SHALL, given a server URL, perform the MCP initialization handshake against that URL through its server-side proxy and return the server's tool list to the UI.

#### Scenario: Successful listing
- **WHEN** the user submits the URL of a reachable MCP server that responds to `initialize` and `tools/list`
- **THEN** the UI shows every tool returned by `tools/list` and the URL is saved to recent servers

#### Scenario: Server rejects initialization
- **WHEN** the MCP server answers `initialize` with a non-success HTTP status
- **THEN** the UI shows an error that includes the status and the server's response body

#### Scenario: SSE-formatted response
- **WHEN** the MCP server answers `tools/list` with an SSE-formatted body containing a `data:` line
- **THEN** the JSON payload of that line is used as the response

### Requirement: Forward custom request headers
The system SHALL send user-defined request headers to the MCP server on every request of the handshake, so that servers requiring authentication can be explored.

#### Scenario: Authorization header
- **WHEN** the user adds the header `Authorization: Bearer <token>` and submits a URL
- **THEN** the `initialize`, `notifications/initialized` and `tools/list` requests all carry that header

### Requirement: Client identifies as MCP Tool Explorer
The system SHALL identify itself to MCP servers under the name MCP Tool Explorer, both in the `initialize` client info and in the HTTP `User-Agent`.

#### Scenario: Initialize client info
- **WHEN** the proxy sends `initialize`
- **THEN** `params.clientInfo.name` identifies the client as MCP Tool Explorer and the `User-Agent` header names MCP Tool Explorer

### Requirement: UI shows the MCP Tool Explorer name
The UI SHALL present the application as MCP Tool Explorer in the page title and the header.

#### Scenario: Page load
- **WHEN** the user opens the application
- **THEN** the browser tab title and the page header read MCP Tool Explorer

### Requirement: Tool cards show only metadata derived from the server
Each tool card SHALL show the tool name, its description (or a placeholder when absent), the number of input parameters, and its input schema, and SHALL NOT show metadata the server did not provide, such as an authentication status.

#### Scenario: Tool without auth information
- **WHEN** a tool is listed
- **THEN** its card shows no authentication badge

#### Scenario: Parameter count
- **WHEN** a tool's input schema declares three properties
- **THEN** its card reports 3 parameters

### Requirement: UI describes only supported features
The UI SHALL describe the application as discovering tools and SHALL NOT claim it can test or call them.

#### Scenario: Header copy
- **WHEN** the user reads the introductory text under the header
- **THEN** it describes discovering or listing tools and does not mention testing them

### Requirement: Footer states the real protocol version and repository
The footer SHALL show the MCP protocol version the client requests during initialization and SHALL link to the project's public source repository.

#### Scenario: Footer contents
- **WHEN** the user views the footer
- **THEN** it shows protocol version `2024-11-05` and a GitHub link to `https://github.com/sbrandollo/mcp-inspector`
