import { Message } from '../types';

const API_BASE_URL = '/api/vector';

export class VectorStore {
  private static instance: VectorStore;

  private constructor() {}

  static async getInstance(): Promise<VectorStore> {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  async addMessage(message: Message): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Failed to add message:', error);
      throw error;
    }
  }

  async searchSimilarMessages(query: string, limit: number = 5): Promise<Message[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      const results = await response.json();
      return results.map((result: any) => ({
        id: result.id,
        content: result.text,
        role: result.metadata.role,
        timestamp: new Date(result.metadata.timestamp),
      }));
    } catch (error) {
      console.error('Failed to search messages:', error);
      throw error;
    }
  }

  async addDocument(id: string, content: string, metadata: Record<string, any>): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, content, metadata }),
      });
    } catch (error) {
      console.error('Failed to add document:', error);
      throw error;
    }
  }

  async searchDocuments(query: string, limit: number = 5): Promise<Array<{ id: string; content: string; metadata: Record<string, any> }>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/documents/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to search documents:', error);
      throw error;
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }
}