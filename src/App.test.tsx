import { render, screen } from './test/test-utils';
import App from './App';

// Mock the ChatContainer and Sidebar components to simplify testing
jest.mock('./components/sidebar/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar Component</div>
}));

jest.mock('./components/chat/chat-container', () => ({
  ChatContainer: () => <div data-testid="chat-container">Chat Container Component</div>
}));

describe('App component', () => {
  it('renders without crashing', () => {
    render(<App />);
    
    // Check that the main layout elements are rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
  });
  
  it('has the correct layout structure', () => {
    render(<App />);
    
    // The main app container should have flex layout
    const appContainer = screen.getByTestId('sidebar').parentElement;
    expect(appContainer).toHaveClass('flex');
    expect(appContainer).toHaveClass('h-screen');
    
    // Sidebar should be rendered before chat container (proper order)
    const children = appContainer?.childNodes;
    expect(children?.[0]).toBe(screen.getByTestId('sidebar'));
    expect(children?.[1]).toBe(screen.getByTestId('chat-container'));
  });
});