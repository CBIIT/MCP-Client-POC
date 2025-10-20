// MCP routes for Express server
import { Router } from 'express';
import { mcpManager } from '../mcp/MCPConnectionManager.js';

const router = Router();

// Initialize manager on server start (will be called from server.js)
export async function initializeMCP() {
  try {
    await mcpManager.initialize();
    console.log('MCP servers initialized');
  } catch (error) {
    console.error('Failed to initialize MCP servers:', error);
  }
}

// List connected servers
router.get('/servers', (req, res) => {
  const servers = Array.from(mcpManager.servers.entries()).map(([name, info]) => ({
    name,
    connected: true,
    toolCount: info.tools.length,
    tools: info.tools.map(t => ({ name: t.name, description: t.description }))
  }));

  res.json({ servers });
});

// List all tools
router.get('/tools', (req, res) => {
  const tools = mcpManager.getAllTools();
  res.json({
    tools,
    count: tools.length
  });
});

// Execute a tool (compatible with client's runTool format)
router.post('/execute', async (req, res) => {
  const { toolUse } = req.body;

  if (!toolUse || !toolUse.name) {
    return res.status(400).json({
      success: false,
      error: 'Tool use object with name is required'
    });
  }

  const { toolUseId, name, input } = toolUse;

  try {
    // Check if this is an MCP tool
    const mcpTools = mcpManager.getAllTools();
    const isMcpTool = mcpTools.some(t => t.name === name);

    if (!isMcpTool) {
      return res.status(404).json({
        success: false,
        error: `Tool ${name} is not an MCP tool`
      });
    }

    // Execute the MCP tool
    const result = await mcpManager.executeTool(name, input || {});

    // Format response in the same format as client's runTool
    if (result.success) {
      res.json({
        toolUseId,
        content: [{ json: { results: result.result } }]
      });
    } else {
      res.json({
        toolUseId,
        content: [{ text: `Error running ${name}: ${result.error}` }]
      });
    }
  } catch (error) {
    console.error(`[MCP] Tool execution error:`, error);
    res.status(500).json({
      toolUseId,
      content: [{ text: `Error running ${name}: ${error.message}` }]
    });
  }
});

// Connect to a new server dynamically
router.post('/connect', async (req, res) => {
  const { serverName, config } = req.body;

  if (!serverName || !config) {
    return res.status(400).json({
      success: false,
      error: 'Server name and config are required'
    });
  }

  try {
    const tools = await mcpManager.connectServer(serverName, config);
    res.json({
      success: true,
      toolCount: tools.length,
      tools: tools.map(t => ({ name: t.name, description: t.description }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Disconnect from a server
router.delete('/servers/:name', async (req, res) => {
  const { name } = req.params;

  await mcpManager.disconnectServer(name);
  res.json({ success: true });
});

// Health check for a server
router.get('/servers/:name/health', async (req, res) => {
  const { name } = req.params;

  const healthy = await mcpManager.checkHealth(name);
  res.json({
    serverName: name,
    healthy
  });
});

// Reinitialize servers
router.post('/reinitialize', async (req, res) => {
  const { serverNames, forceReinit } = req.body;

  try {
    await mcpManager.reinitialize(serverNames || [], forceReinit || false);
    res.json({
      success: true,
      servers: Array.from(mcpManager.servers.keys())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down MCP connections...');
  await mcpManager.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down MCP connections...');
  await mcpManager.cleanup();
  process.exit(0);
});

export default router;