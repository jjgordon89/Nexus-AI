import React from 'react';
import { Button } from '../../ui/button';
import { ExternalLinkIcon, GithubIcon, TwitterIcon } from 'lucide-react';

export const AboutSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">About NexusAI</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Information about the application and helpful resources.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Version</h3>
          <p className="text-sm text-muted-foreground">1.0.0</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Description</h3>
          <p className="text-sm text-muted-foreground">
            NexusAI is your personal AI assistant, designed to help you with a wide range of tasks
            while maintaining privacy and security.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Resources</h3>
          <div className="grid gap-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.open('https://docs.nexusai.com', '_blank')}
            >
              <ExternalLinkIcon className="h-4 w-4" />
              Documentation
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.open('https://github.com/nexusai', '_blank')}
            >
              <GithubIcon className="h-4 w-4" />
              GitHub Repository
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.open('https://twitter.com/nexusai', '_blank')}
            >
              <TwitterIcon className="h-4 w-4" />
              Follow us on Twitter
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Legal</h3>
          <div className="space-y-1">
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => window.open('/terms', '_blank')}
            >
              Terms of Service
            </Button>
            <Button
              variant="link"
              className="h-auto p-0 text-sm block"
              onClick={() => window.open('/privacy', '_blank')}
            >
              Privacy Policy
            </Button>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 NexusAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};