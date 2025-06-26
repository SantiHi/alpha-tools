import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  BookText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "My Portfolios",
    url: "#",
    icon: BookText,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

const AppSidebar = () => {
  return (
    <Sidebar className="bg-purple text-white p-3">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-4xl ml-auto mr-auto">
            Alpha-Edge
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-5">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="m-1 bg-dark hover:brightness-75 rounded-b-md p-1"
                >
                  <SidebarMenuButton
                    asChild
                    className="[&>svg]:size-7 [&>svg]:ml-2"
                  >
                    <a href={item.url} className="flex items-center">
                      <item.icon className="text-white" />
                      <span className="text-white text-[15px]">
                        {item.title}
                      </span>
                    </a>
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

export default AppSidebar;
