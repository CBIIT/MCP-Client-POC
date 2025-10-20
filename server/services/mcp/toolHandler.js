// MCP Tool Execution Handler
// Handles tool execution results from AI model calls

import { mcpManager } from './MCPConnectionManager.js';

/**
 * Execute an MCP tool call from the AI model
 * @param {Object} toolUse - Tool use object from AI model
 * @returns {Object} Tool result to send back to AI
 */
export async function executeMCPTool(toolUse) {
  const { name, input } = toolUse;

  try {
    console.log(`[MCP] Executing tool: ${name}`, input);

    // Execute tool through MCP manager
    const result = await mcpManager.executeTool(name, input);

    if (result.success) {
      console.log(`[MCP] Tool ${name} executed successfully on ${result.serverName}`);

      // Format result for AI model
      return {
        toolUseId: toolUse.toolUseId,
        content: [
          {
            json: result.result
          }
        ]
      };
    } else {
      console.error(`[MCP] Tool ${name} failed:`, result.error);

      // Return error to AI model
      return {
        toolUseId: toolUse.toolUseId,
        content: [
          {
            text: `Error executing tool ${name}: ${result.error}`
          }
        ],
        isError: true
      };
    }
  } catch (error) {
    console.error(`[MCP] Tool execution failed for ${name}:`, error);

    return {
      toolUseId: toolUse.toolUseId,
      content: [
        {
          text: `Tool execution failed: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

/**
 * Check if a tool is an MCP tool
 * @param {string} toolName - Name of the tool
 * @returns {boolean} True if it's an MCP tool
 */
export function isMCPTool(toolName) {
  const mcpTools = mcpManager.getAllTools();
  return mcpTools.some(tool => tool.name === toolName);
}

/**
 * Process tool calls from AI response
 * Executes MCP tools and returns results
 * @param {Array} toolUses - Array of tool use objects from AI
 * @returns {Array} Tool results to add to conversation
 */
export async function processMCPToolCalls(toolUses) {
  if (!toolUses || !Array.isArray(toolUses)) {
    return [];
  }

  const results = [];

  for (const toolUse of toolUses) {
    if (isMCPTool(toolUse.name)) {
      const result = await executeMCPTool(toolUse);
      results.push(result);
    }
  }

  return results;
}