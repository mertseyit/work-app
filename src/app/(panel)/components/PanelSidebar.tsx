'use client';

import { BadgeTurkishLira, BriefcaseBusiness, ClipboardList } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const PanelSidebar = () => {
  const pathname = usePathname();

  // Helper: Tam eşleşme (Alt menüler için)
  // Örn: Sadece '/work-track' ise true döner, '/work-track/clients' ise false döner.
  const isExactActive = (url: string) => pathname === url;

  // Helper: Kapsayıcı eşleşme (Ana menüler ve Accordion tetikleyicisi için)
  // Örn: '/work-track' ile başlayan her şeyde true döner.
  const isParentActive = (url: string) => pathname.startsWith(url);

  // Ortak stil sınıfları (Tekrarı önlemek için değişkene aldım, istersen inline yazabilirsin)
  const menuButtonBaseClass =
    'border-2 my-1 transition-all duration-150 hover:bg-blue-50 dark:hover:bg-blue-300/10';
  const activeClass = 'border-blue-300 dark:border-blue-300/50 bg-card dark:bg-blue-400/10';
  const subMenuLinkBaseClass =
    'flex items-center gap-2 px-4 py-2 text-xs rounded-md transition-colors hover:text-blue-600';
  const subMenuActiveClass = 'bg-accent-foreground/5 font-medium'; // Kırmızı yerine mavi ton kullandım, değiştirebilirsin.

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader className="border-b pb-3 flex items-center justify-center">
          <span className="text-xl font-semibold">İş Takip</span>
        </SidebarHeader>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* --- 1. MENÜ: FİNANS (TEKİL) --- */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={cn(menuButtonBaseClass, isExactActive('/finance') && activeClass)}
                >
                  <Link href="/finance">
                    <BadgeTurkishLira />
                    <span className="text-xs font-semibold">Finans</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* --- 2. MENÜ: İŞ TAKİP (ACCORDION / SUB-MENU) --- */}
              <SidebarMenuItem>
                {/* defaultValue: Sayfa yenilendiğinde eğer bu menünün altındaysak açık kalsın.
                    type="single" collapsible: Standart accordion davranışı.
                */}
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={isParentActive('/work-track') ? 'work-track-item' : ''}
                  className="w-full"
                >
                  <AccordionItem value="work-track-item" className="border-none">
                    <AccordionTrigger
                      className={cn(
                        'flex w-full items-center justify-between py-2 px-2 text-sm font-medium hover:no-underline',
                        menuButtonBaseClass, // Senin genel buton stilin
                        isParentActive('/work-track') && activeClass, // Eğer alt sayfalardaysak burası aktif görünsün
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness size={16} />
                        <span className="text-xs font-semibold">İş Takip</span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-1 pb-2 pl-2">
                      <div className="flex flex-col gap-1 border-l-2 border-slate-100 ml-2 pl-2">
                        {/* Sub Item 1: Ana Sayfa */}
                        <Link
                          href="/work-track"
                          className={cn(
                            subMenuLinkBaseClass,
                            isExactActive('/work-track') && subMenuActiveClass,
                          )}
                        >
                          Ana Sayfa
                        </Link>

                        {/* Sub Item 2: Müşteri Listesi */}
                        <Link
                          href="/work-track/clients"
                          className={cn(
                            subMenuLinkBaseClass,
                            isExactActive('/work-track/clients') && subMenuActiveClass,
                          )}
                        >
                          Müşteri Listesi
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </SidebarMenuItem>

              {/* --- 3. MENÜ: GÖREV LİSTESİ (TEKİL) --- */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={cn(menuButtonBaseClass, isParentActive('/task-list') && activeClass)}
                >
                  <Link href="/task-list">
                    <ClipboardList />
                    <span className="text-xs font-semibold">Görev Listesi</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default PanelSidebar;
