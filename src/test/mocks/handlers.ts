/**
 * Mock API request handlers for testing
 * 
 * This module provides request handlers for the Mock Service Worker (MSW)
 * to intercept and mock HTTP requests during tests.
 */

import { http, HttpResponse, delay } from 'msw';
import { nanoid } from 'nanoid';

/**
 * Mock conversation data
 */
const mockConversations = [
  {
    id: 'conv-1',
    title: 'Test Conversation 1',
    model: 'gpt-4',
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2025-01-01T12:00:00.000Z',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello, AI!',
        timestamp: '2025-01-01T12:00:00.000Z'
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: '2025-01-01T12:00:10.000Z'
      }
    ]
  },
  {
    id: 'conv-2',
    title: 'Test Conversation 2',
    model: 'gpt-3.5-turbo',
    createdAt: '2025-01-02T12:00:00.000Z',
    updatedAt: '2025-01-02T12:00:00.000Z',
    messages: []
  }
];

/**
 * Mock user settings
 */
const mockSettings = {
  profile: {
    name: 'Test User',
    email: 'test@example.com',
  },
  ai: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemMessage: 'You are a helpful AI assistant.',
    streamResponses: true,
  },
  appearance: {
    theme: 'dark',
    language: 'en',
    fontSize: 16,
  },
  privacy: {
    dataSharing: false,
    analyticsEnabled: false,
    historyEnabled: true,
  }
};

/**
 * Mock user data
 */
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
};

/**
 * Mock authentication token
 */
const mockAuthToken = 'mock-jwt-token';

/**
 * MSW handlers for API endpoints
 */
export const handlers = [
  // Health check endpoint
  http.get('/api/health', async () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    // Simple validation
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        user: mockUser,
        token: mockAuthToken
      });
    }
    
    return new HttpResponse(
      JSON.stringify({ error: 'Authentication Failed', message: 'Invalid email or password' }),
      { status: 401 }
    );
  }),
  
  http.post('/api/auth/register', async ({ request }) => {
    const { email, password, name } = await request.json();
    
    // Check if email is already taken
    if (email === 'test@example.com') {
      return new HttpResponse(
        JSON.stringify({ error: 'Conflict', message: 'A user with this email already exists' }),
        { status: 409 }
      );
    }
    
    return HttpResponse.json({
      user: { id: nanoid(), email, name },
      token: 'new-user-token'
    }, { status: 201 });
  }),

  // Conversation endpoints
  http.get('/api/conversations', async () => {
    await delay(100); // Add realistic delay
    
    return HttpResponse.json({
      conversations: mockConversations.map(({ messages, ...conv }) => conv)
    });
  }),
  
  http.post('/api/conversations', async ({ request }) => {
    const { title, model } = await request.json();
    
    const newConversation = {
      id: nanoid(),
      title,
      model,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(newConversation, { status: 201 });
  }),
  
  http.get('/api/conversations/:id', async ({ params }) => {
    const { id } = params;
    
    const conversation = mockConversations.find(conv => conv.id === id);
    
    if (!conversation) {
      return new HttpResponse(
        JSON.stringify({ error: 'Not Found', message: 'Conversation not found' }), 
        { status: 404 }
      );
    }
    
    return HttpResponse.json(conversation);
  }),
  
  http.put('/api/conversations/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const conversation = mockConversations.find(conv => conv.id === id);
    
    if (!conversation) {
      return new HttpResponse(
        JSON.stringify({ error: 'Not Found', message: 'Conversation not found' }), 
        { status: 404 }
      );
    }
    
    const updatedConversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Remove messages for the response
    const { messages, ...convWithoutMessages } = updatedConversation;
    
    return HttpResponse.json(convWithoutMessages);
  }),
  
  http.delete('/api/conversations/:id', async ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ success: true });
  }),
  
  http.post('/api/conversations/:id/messages', async ({ params, request }) => {
    const { id } = params;
    const message = await request.json();
    
    const newMessage = {
      id: nanoid(),
      ...message,
      timestamp: new Date().toISOString()
    };
    
    return HttpResponse.json(newMessage, { status: 201 });
  }),

  // Chat endpoint
  http.post('/api/chat', async ({ request }) => {
    await delay(500); // Simulate AI response time
    
    const { provider, model, messages } = await request.json();
    
    // Get the last message content for context
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    return HttpResponse.json({
      id: nanoid(),
      model,
      message: {
        role: 'assistant',
        content: `This is a mock response from the ${provider} provider using ${model}. You asked: "${lastMessage.substring(0, 50)}${lastMessage.length > 50 ? '...' : ''}"`,
      },
      usage: {
        promptTokens: messages.reduce((acc, m) => acc + m.content.length, 0) / 4,
        completionTokens: 42,
        totalTokens: messages.reduce((acc, m) => acc + m.content.length, 0) / 4 + 42,
      },
    });
  }),
  
  // Streaming chat endpoint - returns a stream of events
  http.post('/api/chat/stream', async ({ request }) => {
    const { provider, model, messages } = await request.json();
    
    // Create a ReadableStream for the SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };
        
        // Get the last message content for context
        const lastMessage = messages[messages.length - 1]?.content || '';
        
        // Split response into tokens
        const response = `This is a mock streaming response from the ${provider} provider using ${model}. You asked: "${lastMessage.substring(0, 50)}${lastMessage.length > 50 ? '...' : ''}"`;
        const tokens = response.split(' ');
        
        // Send each token with a delay
        for (const token of tokens) {
          sendEvent({ token: token + ' ' });
          await delay(50);
        }
        
        // Send completion event
        sendEvent({
          complete: true,
          response: {
            id: nanoid(),
            model,
            message: {
              role: 'assistant',
              content: response,
            },
            usage: {
              promptTokens: messages.reduce((acc, m) => acc + m.content.length, 0) / 4,
              completionTokens: 42,
              totalTokens: messages.reduce((acc, m) => acc + m.content.length, 0) / 4 + 42,
            },
          }
        });
        
        controller.close();
      }
    });
    
    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }),

  // Settings endpoints
  http.get('/api/settings', async () => {
    await delay(100);
    return HttpResponse.json({ settings: mockSettings });
  }),
  
  http.put('/api/settings', async ({ request }) => {
    const updates = await request.json();
    
    const updatedSettings = {
      ...mockSettings,
      ...updates,
      profile: { ...mockSettings.profile, ...updates.profile },
      appearance: { ...mockSettings.appearance, ...updates.appearance },
      ai: { ...mockSettings.ai, ...updates.ai },
    };
    
    // Remove any API keys from the response
    if (updatedSettings.ai) {
      updatedSettings.ai.apiKey = undefined;
    }
    
    return HttpResponse.json({ settings: updatedSettings });
  }),
  
  // File endpoints
  http.post('/api/files/upload', async () => {
    await delay(200);
    
    return HttpResponse.json({
      id: nanoid(),
      name: 'test-file.pdf',
      type: 'application/pdf',
      size: 12345,
      path: '/uploads/test-file.pdf',
      url: '/api/files/test-file.pdf',
    }, { status: 201 });
  }),
  
  http.get('/api/files/:id', async ({ params }) => {
    // This would normally return the file, but for mocking we'll return a 200
    return new HttpResponse(null, { status: 200 });
  }),
  
  http.delete('/api/files/:id', async ({ params }) => {
    return HttpResponse.json({ success: true });
  }),
];