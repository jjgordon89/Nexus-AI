import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { ChatInput } from './chat-input';

describe('ChatInput component', () => {
  const mockSendMessage = jest.fn();
  
  beforeEach(() => {
    mockSendMessage.mockClear();
  });

  it('renders correctly', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isProcessing={false} />);
    
    // Check that the input is rendered
    expect(screen.getByPlaceholderText('Message NexusAI...')).toBeInTheDocument();
    
    // Check for attachment button
    const attachButton = screen.getByRole('button', { name: /attach file/i });
    expect(attachButton).toBeInTheDocument();
    
    // Check for send button (disabled when empty)
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when message is entered', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isProcessing={false} />);
    
    const input = screen.getByPlaceholderText('Message NexusAI...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Initially disabled
    expect(sendButton).toBeDisabled();
    
    // Enter text
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    
    // Now enabled
    expect(sendButton).not.toBeDisabled();
  });

  it('calls onSendMessage when send button is clicked', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isProcessing={false} />);
    
    const input = screen.getByPlaceholderText('Message NexusAI...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Enter text
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    
    // Click send
    fireEvent.click(sendButton);
    
    // Check that the callback was called
    expect(mockSendMessage).toHaveBeenCalledWith('Hello AI', expect.any(Array));
    
    // Check that input is cleared
    expect(input).toHaveValue('');
  });

  it('calls onSendMessage when Enter is pressed', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isProcessing={false} />);
    
    const input = screen.getByPlaceholderText('Message NexusAI...');
    
    // Enter text
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Check that the callback was called
    expect(mockSendMessage).toHaveBeenCalledWith('Hello AI', expect.any(Array));
  });

  it('does not call onSendMessage when Shift+Enter is pressed', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isProcessing={false} />);
    
    const input = screen.getByPlaceholderText('Message NexusAI...');
    
    // Enter text
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    
    // Press Shift+Enter
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    
    // Check that the callback was not called
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('disables input when processing', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isProcessing={true} />);
    
    // Check input is disabled
    const input = screen.getByPlaceholderText('Please wait...');
    expect(input).toBeDisabled();
    
    // Check send button is disabled
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeDisabled();
  });
});