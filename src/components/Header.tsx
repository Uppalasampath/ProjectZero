import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationCenter } from "./NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50" />
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Search..."
            className="pl-10 h-9 border-neutral-300 focus:border-neutral-900 bg-white text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationCenter />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 h-9 w-9"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
