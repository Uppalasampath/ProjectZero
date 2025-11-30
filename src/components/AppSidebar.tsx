import { Home, Recycle, Leaf, ShieldCheck, Building2, Settings, HelpCircle, ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  {
    title: "Marketplace",
    url: "/marketplace",
    icon: Recycle,
    submenu: [
      { title: "Browse Materials", url: "/marketplace" },
      { title: "My Materials", url: "/my-materials" },
      { title: "My Transactions", url: "/my-transactions" },
      { title: "List Waste", url: "/list-waste" },
      { title: "Analytics", url: "/marketplace-analytics" },
    ]
  },
  {
    title: "Carbon",
    url: "/carbon",
    icon: Leaf,
    submenu: [
      { title: "Dashboard", url: "/carbon/dashboard" },
      { title: "Baseline Calculator", url: "/carbon/baseline-calculator" },
      { title: "Emission Sources", url: "/carbon/sources" },
      { title: "Supplier Portal", url: "/carbon/suppliers" },
      { title: "Recommendations", url: "/carbon/recommendations" },
      { title: "Offset Marketplace", url: "/offset-marketplace" },
    ]
  },
  {
    title: "Compliance",
    url: "/compliance",
    icon: ShieldCheck,
    submenu: [
      { title: "Overview", url: "/compliance" },
      { title: "Frameworks", url: "/framework/csrd" },
      { title: "Data Collection", url: "/data-collection" },
      { title: "Report Generation", url: "/report-generation" },
      { title: "Regulatory Monitor", url: "/regulatory-monitor" },
    ]
  },
  { title: "Organization", url: "/organization", icon: Building2 },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isSubmenuActive = (submenu?: Array<{ url: string }>) => {
    if (!submenu) return false;
    return submenu.some(item => location.pathname === item.url || location.pathname.startsWith(item.url + '/'));
  };

  return (
    <Sidebar className="border-r border-neutral-200 bg-white">
      <SidebarContent className="bg-white">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div>
                <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">ZERO</h1>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-neutral-500 text-xs font-medium px-3 py-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <Collapsible
                      open={openMenus[item.title] || isSubmenuActive(item.submenu)}
                      onOpenChange={() => toggleMenu(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className={`${
                          isSubmenuActive(item.submenu)
                            ? "bg-neutral-100 text-neutral-900 font-medium"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}>
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm">{item.title}</span>
                          <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="bg-neutral-50 border-l border-neutral-200">
                          {item.submenu.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.url}>
                              <SidebarMenuSubButton asChild className="bg-neutral-50">
                                <NavLink
                                  to={subItem.url}
                                  className={({ isActive }) =>
                                    `text-sm ${isActive
                                      ? "bg-white text-neutral-900 font-medium"
                                      : "text-neutral-700 hover:bg-white hover:text-neutral-900"
                                    }`
                                  }
                                >
                                  {subItem.title}
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `${isActive
                            ? "bg-neutral-100 text-neutral-900 font-medium"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                          }`
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
