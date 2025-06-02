import { Conversation, Message } from '../types';

type ExportFormat = 'json' | 'markdown' | 'text' | 'html';

export class ExportHandler {
  /**
   * Exports a conversation to a file
   */
  static exportConversation(conversation: Conversation, format: ExportFormat = 'json'): void {
    if (!conversation) return;
    
    let content: string;
    let mimeType: string;
    let extension: string;
    
    switch (format) {
      case 'json':
        content = this.conversationToJson(conversation);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'markdown':
        content = this.conversationToMarkdown(conversation);
        mimeType = 'text/markdown';
        extension = 'md';
        break;
      case 'text':
        content = this.conversationToText(conversation);
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      case 'html':
        content = this.conversationToHtml(conversation);
        mimeType = 'text/html';
        extension = 'html';
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Converts a conversation to JSON format
   */
  private static conversationToJson(conversation: Conversation): string {
    // Create a copy without circular references
    const exportData = {
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      model: conversation.model,
      messages: conversation.messages.map(message => ({
        role: message.role,
        content: message.content,
        timestamp: message.timestamp
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Converts a conversation to Markdown format
   */
  private static conversationToMarkdown(conversation: Conversation): string {
    let markdown = `# ${conversation.title}\n\n`;
    markdown += `**Date:** ${conversation.createdAt.toLocaleString()}\n`;
    markdown += `**Model:** ${conversation.model}\n\n`;
    
    markdown += conversation.messages.map(message => {
      const role = this.formatRole(message.role);
      const timestamp = message.timestamp.toLocaleTimeString();
      
      return `## ${role} (${timestamp})\n\n${message.content}\n\n`;
    }).join('---\n\n');
    
    return markdown;
  }
  
  /**
   * Converts a conversation to plain text format
   */
  private static conversationToText(conversation: Conversation): string {
    let text = `${conversation.title}\n`;
    text += `Date: ${conversation.createdAt.toLocaleString()}\n`;
    text += `Model: ${conversation.model}\n\n`;
    
    text += conversation.messages.map(message => {
      const role = this.formatRole(message.role);
      const timestamp = message.timestamp.toLocaleTimeString();
      
      return `${role} (${timestamp}):\n${message.content}\n`;
    }).join('\n---\n\n');
    
    return text;
  }
  
  /**
   * Converts a conversation to HTML format
   */
  private static conversationToHtml(conversation: Conversation): string {
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this.escapeHtml(conversation.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 20px; }
    .message { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .user { background-color: #f5f5f5; border-radius: 8px; padding: 12px; }
    .assistant { background-color: #f0f7ff; border-radius: 8px; padding: 12px; }
    .system { background-color: #fff3cd; border-radius: 8px; padding: 12px; }
    .meta { font-size: 12px; color: #666; margin-bottom: 8px; }
    pre { background-color: #f1f1f1; padding: 10px; border-radius: 4px; overflow-x: auto; }
    code { font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.escapeHtml(conversation.title)}</h1>
    <p>Date: ${conversation.createdAt.toLocaleString()}</p>
    <p>Model: ${this.escapeHtml(conversation.model)}</p>
  </div>
`;
    
    conversation.messages.forEach(message => {
      const role = this.formatRole(message.role);
      const timestamp = message.timestamp.toLocaleTimeString();
      const content = this.formatHtmlContent(message.content);
      
      html += `
  <div class="message ${message.role}">
    <div class="meta">${role} - ${timestamp}</div>
    <div class="content">${content}</div>
  </div>
`;
    });
    
    html += `
</body>
</html>`;
    
    return html;
  }
  
  /**
   * Formats the role for display
   */
  private static formatRole(role: string): string {
    switch (role) {
      case 'user':
        return 'You';
      case 'assistant':
        return 'NexusAI';
      case 'system':
        return 'System';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  }
  
  /**
   * Escapes HTML special characters
   */
  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  /**
   * Formats content for HTML, handling code blocks
   */
  private static formatHtmlContent(content: string): string {
    // Simple code block handling
    content = content.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Handle paragraphs
    content = content
      .split('\n\n')
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
    
    return content;
  }
}