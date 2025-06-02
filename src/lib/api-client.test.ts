import { apiClient, setAuthToken, getAuthToken } from './api-client';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

// Start MSW server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});

// Close server after tests
afterAll(() => server.close());

describe('API Client', () => {
  describe('Auth Token Management', () => {
    it('sets and gets auth token', () => {
      setAuthToken('test-token');
      expect(getAuthToken()).toBe('test-token');
    });
    
    it('persists token in localStorage', () => {
      setAuthToken('test-token');
      
      // Get the stored value and parse it
      const storedValue = JSON.parse(localStorage.getItem('auth_token') || '{}');
      
      expect(storedValue.value).toBe('test-token');
      expect(storedValue.expires).toBeGreaterThan(Date.now());
    });
    
    it('clears token when set to null', () => {
      setAuthToken('test-token');
      setAuthToken(null);
      
      expect(getAuthToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });
  
  describe('Auth API', () => {
    it('handles successful login', async () => {
      const response = await apiClient.auth.login('test@example.com', 'password');
      
      expect(response.user.email).toBe('test@example.com');
      expect(response.token).toBe('mock-jwt-token');
      expect(getAuthToken()).toBe('mock-jwt-token');
    });
    
    it('handles failed login', async () => {
      // Mock a failed login
      server.use(
        http.post('/api/auth/login', () => {
          return new HttpResponse(
            JSON.stringify({ error: 'Authentication Failed', message: 'Invalid credentials' }), 
            { status: 401 }
          );
        })
      );
      
      await expect(apiClient.auth.login('wrong@example.com', 'wrong-password'))
        .rejects
        .toThrow();
    });
    
    it('handles registration', async () => {
      const response = await apiClient.auth.register('new@example.com', 'password', 'New User');
      
      expect(response.user.email).toBe('new@example.com');
      expect(response.user.name).toBe('New User');
      expect(response.token).toBeDefined();
    });
    
    it('handles logout', async () => {
      setAuthToken('test-token');
      
      await apiClient.auth.logout();
      
      expect(getAuthToken()).toBeNull();
    });
  });
  
  describe('Conversations API', () => {
    it('fetches all conversations', async () => {
      const conversations = await apiClient.conversations.getAll();
      
      expect(conversations).toHaveLength(2);
      expect(conversations[0].title).toBe('Test Conversation 1');
      expect(conversations[1].title).toBe('Test Conversation 2');
    });
    
    it('fetches a single conversation', async () => {
      const conversation = await apiClient.conversations.get('conv-1');
      
      expect(conversation.title).toBe('Test Conversation 1');
      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0].content).toBe('Hello, AI!');
    });
    
    it('creates a new conversation', async () => {
      const newConversation = await apiClient.conversations.create('New Conversation', 'gpt-4');
      
      expect(newConversation.title).toBe('New Conversation');
      expect(newConversation.model).toBe('gpt-4');
      expect(newConversation.messages).toHaveLength(0);
    });
    
    it('updates a conversation', async () => {
      await apiClient.conversations.update('conv-1', { title: 'Updated Title' });
      
      // We don't expect a return value, so just check that it doesn't throw
      expect(true).toBe(true);
    });
    
    it('deletes a conversation', async () => {
      await apiClient.conversations.delete('conv-1');
      
      // We don't expect a return value, so just check that it doesn't throw
      expect(true).toBe(true);
    });
    
    it('adds a message to a conversation', async () => {
      const message = await apiClient.conversations.addMessage('conv-1', {
        role: 'user',
        content: 'New message',
      });
      
      expect(message.role).toBe('user');
      expect(message.content).toBe('New message');
      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeInstanceOf(Date);
    });
  });
  
  describe('Chat API', () => {
    it('sends a chat request', async () => {
      const result = await apiClient.chat.send('openai', 'gpt-4', [
        { role: 'user', content: 'Hello AI' }
      ]);
      
      expect(result.message.role).toBe('assistant');
      expect(result.message.content).toContain('This is a mock response');
      expect(result.model).toBe('gpt-4');
    });
  });
  
  describe('Settings API', () => {
    it('gets user settings', async () => {
      const settings = await apiClient.settings.get();
      
      expect(settings.profile.name).toBe('Test User');
      expect(settings.appearance.theme).toBe('dark');
      expect(settings.ai.provider).toBe('openai');
    });
    
    it('updates user settings', async () => {
      const settings = await apiClient.settings.update({
        appearance: { theme: 'light' },
        ai: { model: 'gpt-3.5-turbo' }
      });
      
      expect(settings.appearance.theme).toBe('light');
      expect(settings.ai.model).toBe('gpt-3.5-turbo');
    });
  });
});