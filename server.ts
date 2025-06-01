import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

// Hold all SSE connections
let clients: Response[] = [];

const app = express();
const port = 39300;

app.use(cors());
app.use(express.json());

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

  // Remove client on close
  req.on('close', () => {
    clients = clients.filter((client) => client !== res);
    res.end();
  });
});

// POST endpoint to handle tool calls (e.g., code edits)
app.post('/model_context_protocol/2024-11-05/tool_call', async (req, res) => {
  const toolCall = req.body;
  // Example: pretend to process the tool call (e.g., edit a file)
  // You should add your own code edit logic here

  // This is where you'd perform edits to the codebase, e.g.:
  // await fs.promises.writeFile(toolCall.filePath, toolCall.newContent);

  // Send a response to the POST request
  res.json({ status: 'Tool call received', toolCall });

  // Broadcast result to all SSE clients
  const resultEvent = {
    type: 'tool_result',
    data: {
      message: 'Tool call processed!',
      toolCall,
      // Optionally include edit status, errors, etc.
    },
  };
  clients.forEach(client => {
    client.write(`event: ${resultEvent.type}\ndata: ${JSON.stringify(resultEvent.data)}\n\n`);
  });
});

app.listen(port, () => {
  console.log(`MCP Tool Server running at http://localhost:${port}/model_context_protocol/2024-11-05/sse`);
});