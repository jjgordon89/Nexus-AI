NexusAI - Personal AI Assistant
NexusAI is a modern, feature-rich AI chat application built with React and TypeScript that supports multiple AI providers and offers a beautiful, responsive interface.

Features
🤖 Multi-provider AI support

OpenAI
Anthropic
Google AI
Mistral AI
Groq
HuggingFace
Custom providers via OpenAI-compatible API
💬 Advanced chat capabilities

Real-time streaming responses
Markdown support
Code highlighting
File attachments
Conversation management
🎨 Beautiful UI/UX

Dark/Light/System theme
Responsive design
Smooth animations
Accessibility features
Glass morphism effects
⚙️ Extensive settings

AI provider configuration
Model selection
Temperature control
System message customization
Appearance preferences
Privacy controls
🔒 Privacy & Security

Local storage
Rate limiting
API key validation
Error handling
Data retention controls
Getting Started
Prerequisites
Node.js 18.0.0 or later
npm or yarn
Installation
Clone the repository:

bash
git clone https://github.com/yourusername/nexus-ai.git
cd nexus-ai
Install dependencies:

bash
npm install
Create a .env file in the root directory:

env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_MISTRAL_API_KEY=your_mistral_api_key
VITE_GROQ_API_KEY=your_groq_api_key
Start the development server:

bash
npm run dev
Building for Production
bash
npm run build
The built files will be in the dist directory.

Configuration
AI Providers
NexusAI supports multiple AI providers. Configure them in the settings:

Open the settings panel (gear icon)
Navigate to "AI Settings"
Select your preferred provider
Enter your API key
Configure model settings
Appearance
Customize the app's appearance:

Theme (Light/Dark/System)
Font size
Reduced motion
High contrast mode
Language
Privacy
Control your data:

Data sharing preferences
Analytics settings
History retention
Auto-save options
Development
Project Structure
Code
src/
├── components/     # React components
├── lib/           # Utility functions and hooks
├── store/         # State management
├── types/         # TypeScript types
└── styles/        # CSS and styling
Key Technologies
React 18
TypeScript
Tailwind CSS
Framer Motion
Zustand
Zod
Vite
Adding New Features
Create a new branch
Add your feature
Write tests
Submit a pull request
Contributing
Contributions are welcome! Please read our Contributing Guide for details on our code of conduct and the process for submitting pull requests.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Icons by Lucide
UI components inspired by shadcn/ui
Theme system by next-themes
If you need any further customization or want to add badges, shields, or specific instructions, let me know!
