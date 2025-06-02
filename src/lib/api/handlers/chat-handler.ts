/**
 * Chat API handlers
 * 
 * This module handles requests related to the AI chat functionality.
 */

import { Request, Response } from 'express';
import { AIProviderFactory } from '../../ai/factory';
import { ChatRequest, ChatRequestSchema } from '../types';
import { secureStorage } from '../../secure-storage';
import { getApiKey } from '../../../config';

/**
 * Handle chat request and proxy to AI provider
 */
export async function handleChatRequest(req: Request, res: Response) {
  try {
    // Validate request
    const chatRequest = ChatRequestSchema.parse(req.body);
    
    // Get API key for the requested provider
    const apiKey = getApiKeyForProvider(chatRequest.provider);
    
    if (!apiKey) {
      return res.status(400).json({
        error: 'Missing API Key',
        message: `API key for ${chatRequest.provider} is not configured`
      });
    }
    
    // Create AI provider instance
    const provider = await AIProviderFactory.createProvider(
      chatRequest.provider, 
      apiKey
    );
    
    // Call AI provider
    const response = await provider.chat({
      model: chatRequest.model,
      messages: chatRequest.messages,
      temperature: chatRequest.temperature,
      maxTokens: chatRequest.maxTokens,
      stream: false, // Streaming handled separately
    });
    
    // Return response
    return res.json(response);
  } catch (error) {
    console.error('Chat request error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors
      });
    }
    
    return res.status(500).json({
      error: 'AI Provider Error',
      message: error.message || 'Failed to process chat request'
    });
  }
}

/**
 * Handle streaming chat request
 */
export async function handleStreamingChatRequest(req: Request, res: Response) {
  try {
    // Validate request
    const chatRequest = ChatRequestSchema.parse(req.body);
    
    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Get API key for the requested provider
    const apiKey = getApiKeyForProvider(chatRequest.provider);
    
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({
        error: 'Missing API Key',
        message: `API key for ${chatRequest.provider} is not configured`
      })}\n\n`);
      return res.end();
    }
    
    // Create AI provider instance
    const provider = await AIProviderFactory.createProvider(
      chatRequest.provider, 
      apiKey
    );
    
    // Call AI provider with streaming
    try {
      const response = await provider.chat({
        model: chatRequest.model,
        messages: chatRequest.messages,
        temperature: chatRequest.temperature,
        maxTokens: chatRequest.maxTokens,
        stream: true,
        onToken: (token) => {
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      });
      
      // Send the final response
      res.write(`data: ${JSON.stringify({ complete: true, response })}\n\n`);
    } catch (error) {
      res.write(`data: ${JSON.stringify({
        error: 'AI Provider Error',
        message: error.message || 'Failed to process chat request'
      })}\n\n`);
    } finally {
      res.end();
    }
  } catch (error) {
    console.error('Streaming chat request error:', error);
    
    if (error.name === 'ZodError') {
      res.write(`data: ${JSON.stringify({
        error: 'Validation Error',
        message: error.errors
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({
        error: 'Server Error',
        message: error.message || 'An unexpected error occurred'
      })}\n\n`);
    }
    
    res.end();
  }
}

/**
 * Get the API key for a provider
 */
function getApiKeyForProvider(provider: string): string | undefined {
  // First check environment variables
  const envKey = getApiKey(provider as any);
  
  if (envKey) {
    return envKey;
  }
  
  // Then check secure storage
  return secureStorage.getItem(`${provider}_api_key`);
}