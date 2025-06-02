import { render, screen } from '../../test/test-utils';
import { MessageContent } from './message-content';

describe('MessageContent component', () => {
  it('renders plain text correctly', () => {
    render(<MessageContent content="This is a test message" />);
    
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('renders markdown correctly', () => {
    render(<MessageContent content="# Heading\n\nThis is **bold** text." />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading');
    expect(screen.getByText('This is bold text.').querySelector('strong')).toBeInTheDocument();
  });

  it('renders code blocks correctly', () => {
    render(
      <MessageContent 
        content="```javascript\nconst test = 'Hello';\nconsole.log(test);\n```" 
      />
    );
    
    const codeBlock = screen.getByText(/const test = 'Hello';/);
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock.closest('pre')).toBeInTheDocument();
  });

  it('sanitizes potentially dangerous content', () => {
    render(
      <MessageContent 
        content={`<script>alert("XSS attack");</script>
                 <img src="x" onerror="alert('XSS')">
                 [Click me](javascript:alert('XSS'))`} 
      />
    );
    
    // The script tag should be removed
    expect(screen.queryByText(/XSS attack/)).not.toBeInTheDocument();
    
    // The JavaScript URL protocol should be sanitized
    const links = screen.queryAllByRole('link');
    links.forEach(link => {
      expect(link.getAttribute('href')).not.toContain('javascript:');
    });
  });

  it('allows safe markdown features', () => {
    render(
      <MessageContent 
        content={`
        # Safe Markdown
        
        This is a [safe link](https://example.com).
        
        * List item 1
        * List item 2
        
        > This is a blockquote
        `} 
      />
    );
    
    expect(screen.getByText('Safe Markdown')).toBeInTheDocument();
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('List item 2')).toBeInTheDocument();
    
    expect(screen.getByText('This is a blockquote')).toBeInTheDocument();
  });
});