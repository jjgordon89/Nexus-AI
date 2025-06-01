import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Define Tool interface
interface Tool {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

// Hold all SSE connections
let clients: Response[] = [];

const app = express();
const port = 39300;

app.use(cors());
app.use(express.json());

// File operations tools
const readFileTool: Tool = {
  name: 'readFile',
  description: 'Read content from a file',
  execute: async (params: { filePath: string }) => {
    try {
      const content = await fs.promises.readFile(params.filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};

const writeFileTool: Tool = {
  name: 'writeFile',
  description: 'Write content to a file',
  execute: async (params: { filePath: string, content: string }) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(params.filePath);
      await fs.promises.mkdir(dir, { recursive: true });
      
      // Write file
      await fs.promises.writeFile(params.filePath, params.content);
      return { success: true, filePath: params.filePath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};

const listFilesTool: Tool = {
  name: 'listFiles',
  description: 'List files in a directory',
  execute: async (params: { directory: string }) => {
    try {
      const files = await fs.promises.readdir(params.directory);
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(params.directory, file);
          const stats = await fs.promises.stat(filePath);
          return {
            name: file,
            path: filePath,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
      );
      return { success: true, files: fileStats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};

// Command execution tool
const executeCommandTool: Tool = {
  name: 'executeCommand',
  description: 'Execute a shell command',
  execute: async (params: { command: string }) => {
    return new Promise((resolve) => {
      exec(params.command, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message, stderr });
        } else {
          resolve({ success: true, stdout, stderr });
        }
      });
    });
  }
};

// Project info tool
const projectInfoTool: Tool = {
  name: 'projectInfo',
  description: 'Get information about the project',
  execute: async () => {
    try {
      // Get package.json content
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf-8'));
      
      // Get git info if available
      let gitInfo = null;
      try {
        const gitBranch = await new Promise<string>((resolve, reject) => {
          exec('git branch --show-current', (error, stdout) => {
            if (error) reject(error);
            else resolve(stdout.trim());
          });
        });
        
        gitInfo = { branch: gitBranch };
      } catch {
        // Git not available or not a git repository
      }
      
      return { 
        success: true, 
        name: packageJson.name,
        version: packageJson.version,
        dependencies: packageJson.dependencies,
        devDependencies: packageJson.devDependencies,
        scripts: packageJson.scripts,
        git: gitInfo
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};

// Register all tools
const tools: Record<string, Tool> = {
  readFile: readFileTool,
  writeFile: writeFileTool,
  listFiles: listFilesTool,
  executeCommand: executeCommandTool,
  projectInfo: projectInfoTool
};

// SSE endpoint for tool results
app.get('/model_context_protocol/2024-11-05/sse', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  // Add client to the list
  clients.push(res);

  // Push a welcome event
  res.write(`event: welcome\ndata: "Connected to MCP tool server"\n\n`);
  
  // Push available tools information
  const toolsInfo = Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description
  }));
  
  res.write(`event: tools\ndata: ${JSON.stringify(toolsInfo)}\n\n`);

  // Remove client on close
  req.on('close', () => {
    clients = clients.filter((client) => client !== res);
    res.end();
  });
});

// POST endpoint to handle tool calls
app.post('/model_context_protocol/2024-11-05/tool_call', async (req, res) => {
  const { toolName, params } = req.body;
  
  // Validate the request
  if (!toolName) {
    return res.status(400).json({ error: 'Missing toolName in request body' });
  }
  
  // Check if the tool exists
  const tool = tools[toolName];
  if (!tool) {
    return res.status(404).json({ error: `Tool '${toolName}' not found` });
  }
  
  try {
    // Execute the tool
    const result = await tool.execute(params || {});
    
    // Send response to the POST request
    res.json({ status: 'success', result });
    
    // Broadcast result to all SSE clients
    const resultEvent = {
      type: 'tool_result',
      data: {
        toolName,
        params,
        result
      },
    };
    
    clients.forEach(client => {
      client.write(`event: ${resultEvent.type}\ndata: ${JSON.stringify(resultEvent.data)}\n\n`);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ status: 'error', error: errorMessage });
    
    // Broadcast error to clients
    const errorEvent = {
      type: 'tool_error',
      data: {
        toolName,
        params,
        error: errorMessage
      },
    };
    
    clients.forEach(client => {
      client.write(`event: ${errorEvent.type}\ndata: ${JSON.stringify(errorEvent.data)}\n\n`);
    });
  }
});

// Endpoint to get available tools
app.get('/model_context_protocol/2024-11-05/tools', (req, res) => {
  const toolsInfo = Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description
  }));
  
  res.json(toolsInfo);
});

app.listen(port, () => {
  console.log(`MCP Tool Server running at http://localhost:${port}/model_context_protocol/2024-11-05/sse`);
  console.log(`Available tools: ${Object.keys(tools).join(', ')}`);
});