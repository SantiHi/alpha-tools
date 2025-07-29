// mostly shadcn library, boilerplate code from https://ui.shadcn.com/docs/components/sidebar, own formatting

import { Home, Inbox, Settings, BookText } from "lucide-react"; // lucide react library components
import { UserInfo } from "../context/UserContext";
const INBOX_TITLE = "Inbox";
const PORTFOLIO_TITLE = "My Portfolios";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"; // sidebar from shadcn

// Menu items.
const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: INBOX_TITLE,
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: PORTFOLIO_TITLE,
    url: "/portfolios",
    icon: BookText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const AppSidebar = ({ numberOfNotifications }) => {
  const { isGuest } = UserInfo();
  return (
    <Sidebar className="bg-purple text-white p-3">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-4xl ml-auto mr-auto">
            Alpha-Edge
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-5">
            <SidebarMenu>
              {items.map((item) => {
                if (
                  (item.title == INBOX_TITLE ||
                    item.title == PORTFOLIO_TITLE) &&
                  isGuest == true
                ) {
                  return;
                }
                return (
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
                        {(item.title != INBOX_TITLE ||
                          numberOfNotifications === 0) && (
                          <span className="text-white text-[15px]">
                            {item.title}
                          </span>
                        )}
                        {item.title == INBOX_TITLE &&
                          numberOfNotifications !== 0 && (
                            <div className="flex flex-row justify-center items-center">
                              <span className="text-white text-[15px] mr-3">
                                {item.title}
                              </span>
                              <div className="bg-amber-200 rounded-4xl p-1 text-black">
                                {numberOfNotifications}
                              </div>
                            </div>
                          )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
