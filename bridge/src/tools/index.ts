import { createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk"
import { createPlaygroundTool } from "./create-playground.js"
import { matchAwTool } from "./match-aw.js"
import { searchShadcnTool } from "./search-shadcn.js"

export const SERVER_NAME = "bombardier"

export function createToolServer() {
  return createSdkMcpServer({
    name: SERVER_NAME,
    version: "0.3.0",
    tools: [matchAwTool, searchShadcnTool, createPlaygroundTool],
  })
}

export const allowedTools = [
  `mcp__${SERVER_NAME}__match_aw`,
  `mcp__${SERVER_NAME}__search_shadcn`,
  `mcp__${SERVER_NAME}__create_playground_component`,
]
