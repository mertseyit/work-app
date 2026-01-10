import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import PanelSidebar from './components/PanelSidebar';
import PanelNavbar from './components/PanelNavbar';

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <PanelSidebar />
      <main className="w-full">
        <PanelNavbar>
          <SidebarTrigger />
        </PanelNavbar>
        {children}
      </main>
    </SidebarProvider>
  );
};

export default PanelLayout;
