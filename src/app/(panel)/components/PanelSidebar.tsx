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
import Link from 'next/link';

// Menu items.
const items = [
  {
    title: 'Finans',
    url: '/finans',
    icon: BadgeTurkishLira,
  },
  {
    title: 'İş Takip',
    url: '/is-takip',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Görev Listesi',
    url: '/görev-listesi',
    icon: ClipboardList,
  },
];

const PanelSidebar = () => {
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
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="border  border-primary-brand my-1 ">
                      <item.icon className="text-secondary-brand" />
                      <span className="text-primary-brand text-xs font-semibold">{item.title}</span>
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
