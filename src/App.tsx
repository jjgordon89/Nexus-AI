import React from 'react';
import { Sidebar } from './components/sidebar/sidebar';
import { ChatContainer } from './components/chat/chat-container';

function App() {
  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <Sidebar />
      <ChatContainer />
    </div>
  );
}

export default App;