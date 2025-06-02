import { render, screen, fireEvent } from '../../test/test-utils';
import { Sidebar } from './sidebar';

// Mock the Dialog component to avoid rendering it
jest.mock('../ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the settings dialog
jest.mock('../settings/settings-dialog', () => ({
  SettingsDialog: () => <div data-testid="settings-dialog">Settings Dialog Content</div>
}));

// Mock the useAppStore hook
jest.mock('../../store/app-store', () => ({
  useAppStore: jest.fn().mockImplementation((selector) => {
    const state = {
      conversations: [
        { id: 'conv-1', title: 'Conversation 1', messages: [] },
        { id: 'conv-2', title: 'Conversation 2', messages: [] },
      ],
      currentConversationId: 'conv-1',
      createNewConversation: jest.fn(),
    };
    
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  }),
}));

describe('Sidebar component', () => {
  it('renders correctly', () => {
    render(<Sidebar />);
    
    // Check for sidebar header
    expect(screen.getByText('NexusAI')).toBeInTheDocument();
    
    // Check for sidebar content - should show conversations in chats tab
    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
    expect(screen.getByText('Conversation 2')).toBeInTheDocument();
    
    // Check for sidebar footer with tab buttons
    expect(screen.getByRole('button', { name: /chats/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /docs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
  });

  it('toggles collapse state when collapse button is clicked', () => {
    render(<Sidebar />);
    
    // Initially expanded
    expect(screen.getByText('NexusAI')).toBeInTheDocument();
    
    // Click collapse button
    const collapseButton = screen.getByRole('button', { 
      name: /chevronlefticon/i 
    });
    fireEvent.click(collapseButton);
    
    // Now NexusAI text should be hidden
    expect(screen.queryByText('NexusAI')).not.toBeInTheDocument();
  });

  it('switches tabs when tab buttons are clicked', () => {
    render(<Sidebar />);
    
    // Start in Chats tab
    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
    
    // Click Documents tab
    const docsTab = screen.getByRole('button', { name: /docs/i });
    fireEvent.click(docsTab);
    
    // Should show documents text instead of conversations
    expect(screen.queryByText('Conversation 1')).not.toBeInTheDocument();
    expect(screen.getByText(/document library will be available/i)).toBeInTheDocument();
  });

  it('opens settings dialog when settings button is clicked', () => {
    render(<Sidebar />);
    
    // Settings dialog should not be visible initially
    expect(screen.queryByTestId('settings-dialog')).not.toBeInTheDocument();
    
    // Click Settings tab
    const settingsTab = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsTab);
    
    // Settings dialog should be visible
    expect(screen.getByTestId('settings-dialog')).toBeInTheDocument();
  });
});