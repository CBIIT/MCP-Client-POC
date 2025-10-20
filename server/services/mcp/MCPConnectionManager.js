// MCP Connection Manager for Node.js
// Manages connections to multiple MCP servers and tool execution

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export class MCPConnectionManager {
  constructor() {
    this.servers = new Map();      // serverName -> {client, transport, tools}
    this.toolsByServer = new Map(); // serverName -> [tools]
    this.cleanupFunctions = [];    // For resource cleanup (like Python's AsyncExitStack)
  }

  /**
   * Initialize MCP servers from config file
   * @param {string} configPath - Path to mcp-servers.json
   */
  async initialize(configPath = './config/mcp-servers.json') {
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);

      for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
        await this.connectServer(serverName, serverConfig);
      }
    } catch (error) {
      console.error('Failed to load MCP config:', error);
      // Don't throw - allow server to start without MCP if config missing
      console.log('Server will run without MCP connections');
    }
  }

  /**
   * Connect to a single MCP server
   * @param {string} serverName - Name of the server
   * @param {object} config - Server configuration {command, args, env}
   */
  async connectServer(serverName, config) {
    try {
      console.log(`Connecting to MCP server: ${serverName}`);

      // Create transport based on command type
      let transport;

      if (config.command === 'docker') {
        transport = await this.createDockerTransport(config);
      } else {
        transport = await this.createStdioTransport(config);
      }

      // Create and connect client
      const client = new Client({
        name: `mcp-client-poc`,
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      await client.connect(transport);

      // Register cleanup function (like Python's AsyncExitStack)
      this.cleanupFunctions.push(async () => {
        await client.close();
        await transport.close();
      });

      // List available tools
      const toolsResult = await client.listTools();
      const tools = toolsResult.tools || [];

      // Store server info
      this.servers.set(serverName, {
        client,
        transport,
        tools,
        config
      });

      this.toolsByServer.set(serverName, tools);

      console.log(`Connected to ${serverName} with ${tools.length} tools`);
      return tools;

    } catch (error) {
      console.error(`Failed to connect to ${serverName}:`, error);
      // Don't throw - allow other servers to connect
      return [];
    }
  }

  /**
   * Create Docker transport for MCP servers in containers
   */
  async createDockerTransport(config) {
    // Docker exec command for containers
    const dockerArgs = [...config.args];

    return new StdioClientTransport({
      command: 'docker',
      args: dockerArgs,
      env: config.env || {},
      // Handle Docker-specific stdio
      spawn: (command, args, options) => {
        const proc = spawn(command, args, {
          ...options,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Log Docker errors for debugging (but filter out normal output)
        proc.stderr.on('data', (data) => {
          const message = data.toString();
          // Only log actual errors, not normal Docker output
          if (message.includes('error') || message.includes('Error')) {
            console.error(`Docker stderr: ${message}`);
          }
        });

        // Handle process errors
        proc.on('error', (error) => {
          if (error.code === 'ENOENT') {
            console.error('[MCP] Docker not found. Please ensure Docker is installed and running.');
          } else {
            console.error(`[MCP] Docker process error: ${error.message}`);
          }
        });

        return proc;
      }
    });
  }

  /**
   * Create standard stdio transport for local MCP servers
   */
  async createStdioTransport(config) {
    // Expand command if it's npx or similar
    let command = config.command;
    let args = [...(config.args || [])];

    // Handle npx specially
    if (command === 'npx') {
      // npx needs special handling on different platforms
      if (process.platform === 'win32') {
        command = 'npx.cmd';
      }
    }

    // Handle Python commands
    if (command === 'python' || command === 'python3') {
      // Use python3 on Unix, python on Windows
      if (process.platform !== 'win32') {
        command = 'python3';
      }
    }

    return new StdioClientTransport({
      command,
      args,
      env: {
        ...process.env,
        ...(config.env || {})
      }
    });
  }

  /**
   * Disconnect from a specific server
   */
  async disconnectServer(serverName) {
    const server = this.servers.get(serverName);
    if (!server) return;

    try {
      await server.client.close();
      await server.transport.close();
    } catch (error) {
      console.error(`Error disconnecting from ${serverName}:`, error);
    }

    this.servers.delete(serverName);
    this.toolsByServer.delete(serverName);
  }

  /**
   * Execute a tool on the appropriate server
   */
  async executeTool(toolName, args) {
    // Find which server has this tool
    for (const [serverName, tools] of this.toolsByServer.entries()) {
      const tool = tools.find(t => t.name === toolName);
      if (tool) {
        const server = this.servers.get(serverName);
        if (!server) {
          throw new Error(`Server ${serverName} not connected`);
        }

        try {
          const result = await server.client.callTool({
            name: toolName,
            arguments: args
          });

          return {
            success: true,
            result,
            serverName
          };
        } catch (error) {
          console.error(`Tool execution failed on ${serverName}:`, error);
          return {
            success: false,
            error: error.message,
            serverName
          };
        }
      }
    }

    throw new Error(`Tool ${toolName} not found on any connected server`);
  }

  /**
   * Get all available tools from all servers
   */
  getAllTools() {
    const allTools = [];

    for (const [serverName, tools] of this.toolsByServer.entries()) {
      // Add server info to each tool
      const toolsWithServer = tools.map(tool => ({
        ...tool,
        serverName
      }));
      allTools.push(...toolsWithServer);
    }

    return allTools;
  }

  /**
   * Check server health
   */
  async checkHealth(serverName) {
    const server = this.servers.get(serverName);
    if (!server) return false;

    try {
      // Try to list tools as a health check
      await server.client.listTools();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clean up all connections (like Python's AsyncExitStack)
   */
  async cleanup() {
    console.log('Cleaning up MCP connections...');

    // Execute all cleanup functions in reverse order
    for (const cleanupFn of this.cleanupFunctions.reverse()) {
      try {
        await cleanupFn();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }

    this.servers.clear();
    this.toolsByServer.clear();
    this.cleanupFunctions = [];
  }

  /**
   * Reinitialize servers (like zin's dynamic management)
   */
  async reinitialize(serverNames, forceReinit = false) {
    const currentServers = new Set(this.servers.keys());
    const requestedServers = new Set(serverNames);

    // Check if we need to reinitialize
    const needsReinit = forceReinit ||
      currentServers.size !== requestedServers.size ||
      ![...currentServers].every(s => requestedServers.has(s));

    if (!needsReinit) {
      console.log('Servers already initialized, skipping...');
      return;
    }

    // Clean up existing connections
    await this.cleanup();

    // Reconnect to requested servers
    const config = JSON.parse(await fs.readFile('./config/mcp-servers.json', 'utf-8'));

    for (const serverName of serverNames) {
      if (config.mcpServers[serverName]) {
        await this.connectServer(serverName, config.mcpServers[serverName]);
      }
    }
  }

  /**
   * Format tools for Bedrock/Claude format
   */
  formatToolsForBedrock() {
    const tools = this.getAllTools();

    return tools.map(tool => {
      try {
        // MCP provides inputSchema as a direct JSON schema object
        // Bedrock expects it wrapped in a 'json' property

        // Ensure we have a valid schema object
        let schema = tool.inputSchema;

        // Handle various schema formats
        if (!schema || typeof schema !== 'object') {
          // No schema provided, use minimal default
          schema = {
            type: 'object',
            properties: {},
            required: []
          };
        } else if (!schema.type) {
          // Schema exists but missing type, assume object
          schema = {
            type: 'object',
            properties: schema.properties || {},
            required: schema.required || [],
            ...schema
          };
        }

        // Ensure required fields exist
        if (!schema.properties) schema.properties = {};
        if (!schema.required) schema.required = [];

        const formatted = {
          toolSpec: {
            name: tool.name,
            description: tool.description || `MCP tool: ${tool.name}`,
            inputSchema: {
              json: schema
            }
          }
        };

        return formatted;
      } catch (error) {
        console.error(`[MCP] Error formatting tool ${tool.name}:`, error);
        // Return a safe default format
        return {
          toolSpec: {
            name: tool.name,
            description: tool.description || `MCP tool: ${tool.name}`,
            inputSchema: {
              json: {
                type: 'object',
                properties: {},
                required: []
              }
            }
          }
        };
      }
    });
  }
}

// Create singleton instance
export const mcpManager = new MCPConnectionManager();