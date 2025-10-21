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
    title: "Circular Marketplace", 
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
    title: "Carbon Engine", 
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
    title: "Compliance Autopilot", 
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
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-eco flex items-center justify-center shadow-eco">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            {open && (
              <div>
                <h1 className="text-2xl font-bold text-sidebar-foreground">ZERO</h1>
                <p className="text-xs text-sidebar-foreground/70">Sustainable Future</p>
              </div>
            )}
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
                        <SidebarMenuButton className={isSubmenuActive(item.submenu) ? "bg-sidebar-accent text-sidebar-primary font-medium" : ""}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.url}>
                              <SidebarMenuSubButton asChild>
                                <NavLink
                                  to={subItem.url}
                                  className={({ isActive }) =>
                                    isActive
                                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                                      : "hover:bg-sidebar-accent/50"
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
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
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
