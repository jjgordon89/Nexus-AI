import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { SunIcon, MoonIcon, LaptopIcon } from 'lucide-react';
import { Tooltip } from './ui/tooltip';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Tooltip content="Light theme">
        <Button
          variant={theme === 'light' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setTheme('light')}
          className="h-8 w-8"
        >
          <SunIcon className="h-4 w-4" />
          <span className="sr-only">Light theme</span>
        </Button>
      </Tooltip>

      <Tooltip content="Dark theme">
        <Button
          variant={theme === 'dark' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setTheme('dark')}
          className="h-8 w-8"
        >
          <MoonIcon className="h-4 w-4" />
          <span className="sr-only">Dark theme</span>
        </Button>
      </Tooltip>

      <Tooltip content="System theme">
        <Button
          variant={theme === 'system' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setTheme('system')}
          className="h-8 w-8"
        >
          <LaptopIcon className="h-4 w-4" />
          <span className="sr-only">System theme</span>
        </Button>
      </Tooltip>
    </div>
  );
}