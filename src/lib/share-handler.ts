import { Conversation } from '../types';
import { nanoid } from 'nanoid';

interface ShareOptions {
  type: 'link' | 'copy' | 'email';
  includeAttachments?: boolean;
}

export class ShareHandler {
  /**
   * Share a conversation based on the selected method
   */
  static async shareConversation(conversation: Conversation, options: ShareOptions): Promise<boolean> {
    try {
      switch (options.type) {
        case 'link':
          return await this.shareAsLink(conversation, options);
        case 'copy':
          return await this.copyToClipboard(conversation, options);
        case 'email':
          return this.shareViaEmail(conversation, options);
        default:
          throw new Error(`Unsupported share type: ${options.type}`);
      }
    } catch (error) {
      console.error('Failed to share conversation:', error);
      return false;
    }
  }

  /**
   * Generate a shareable representation of the conversation
   */
  private static formatConversation(conversation: Conversation, includeAttachments: boolean = false): string {
    const messageText = conversation.messages
      .map(msg => {
        const sender = msg.role === 'user' ? 'You' : 'NexusAI';
        const attachmentInfo = includeAttachments && msg.attachments && msg.attachments.length > 0
          ? `\n[Attachments: ${msg.attachments.map(a => a.name).join(', ')}]`
          : '';
        
        return `${sender}: ${msg.content}${attachmentInfo}`;
      })
      .join('\n\n');
    
    return `Conversation: ${conversation.title}\n\n${messageText}`;
  }

  /**
   * Create a shareable link for the conversation
   * In a real app, this would create a server-side share link
   * For this demo, we'll simulate it
   */
  private static async shareAsLink(conversation: Conversation, options: ShareOptions): Promise<boolean> {
    // In a real implementation, this would create a server-side share
    // Here we'll create a simulated link that would be valid in a real app
    const shareId = nanoid(10);
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    
    // Copy the link to clipboard
    return this.copyTextToClipboard(shareUrl);
  }

  /**
   * Copy the conversation to clipboard
   */
  private static async copyToClipboard(conversation: Conversation, options: ShareOptions): Promise<boolean> {
    const text = this.formatConversation(conversation, options.includeAttachments);
    return this.copyTextToClipboard(text);
  }

  /**
   * Copy text to clipboard
   */
  private static async copyTextToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Fallback method for clipboard copy
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }

  /**
   * Share via email
   */
  private static shareViaEmail(conversation: Conversation, options: ShareOptions): boolean {
    const subject = encodeURIComponent(`NexusAI Conversation: ${conversation.title}`);
    const body = encodeURIComponent(this.formatConversation(conversation, options.includeAttachments));
    
    // Open the default email client
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    return true;
  }
}