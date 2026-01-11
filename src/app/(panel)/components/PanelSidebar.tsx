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

// Menu items.
const items = [
  {
    title: 'Finans',
    url: '/finance',
    icon: BadgeTurkishLira,
  },
  {
    title: 'İş Takip',
    url: '/work-track',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Görev Listesi',
    url: '/task-list',
    icon: ClipboardList,
  },
];

const PanelSidebar = () => {
  const pathName = usePathname();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader className="border-b pb-3 flex items-center justify-center">
          <span className="text-xl font-semibold">İş Takip</span>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`${cn(
                      item.url === pathName &&
                        'border-blue-300 dark:border-blue-300/50 bg-blue-50 dark:bg-blue-400/10',
                    )} hover:bg-blue-50 dark:hover:bg-blue-300/10 border-2 my-1 transition-all duration-150 `}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span className=" text-xs font-semibold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default PanelSidebar;
