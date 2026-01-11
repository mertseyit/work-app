'use client';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const PanelNavbar = ({ children }: { children: React.ReactNode }) => {
  const { setTheme } = useTheme();
  return (
    <nav className="flex items-center sticky top-0 w-full justify-between x-container py-2 border-b bg-accent">
      {children}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={() => setTheme((pre) => (pre === 'dark' ? 'light' : 'dark'))}
          variant={'outline'}
          size={'icon-sm'}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <UserButton />
      </div>
    </nav>
  );
};

export default PanelNavbar;
