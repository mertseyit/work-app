import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import PanelSidebar from './components/PanelSidebar';
import PanelNavbar from './components/PanelNavbar';
import { checkAndAddUser } from '@/lib/actions/user';

const PanelLayout = async ({ children }: { children: React.ReactNode }) => {
  //kullanıcı sisteme giriş yaptığı anda ilk geleceği kısım /finance sayfasıdır. Yine de layout.tsx dosyasında kullanıcı giriş veya kayıt yaptığı anda kullanıcı var mı diye kontrol et. checkAndAddUser bu işlemi yapıyor.
  await checkAndAddUser();
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
