import { useState } from "react";
import { Bell, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("All notifications marked as read");
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getAreaBadge = (type: string) => {
    if (type.includes('transaction') || type.includes('marketplace')) {
      return { label: "Marketplace", color: "bg-primary text-primary-foreground" };
    }
    if (type.includes('carbon') || type.includes('emission')) {
      return { label: "Carbon", color: "bg-success text-success-foreground" };
    }
    if (type.includes('compliance') || type.includes('regulatory')) {
      return { label: "Compliance", color: "bg-accent text-accent-foreground" };
    }
    return { label: "System", color: "bg-muted text-muted-foreground" };
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.action_url) {
      navigate(notification.action_url);
      setOpen(false);
    }
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const filterNotifications = (type: string) => {
    if (type === 'all') return notifications;
    if (type === 'unread') return notifications.filter(n => !n.read);
    
    return notifications.filter(n => {
      const area = getAreaBadge(n.notification_type);
      return area.label === type;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b px-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="Marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="Carbon">Carbon</TabsTrigger>
            <TabsTrigger value="Compliance">Compliance</TabsTrigger>
          </TabsList>

          {['all', 'unread', 'Marketplace', 'Carbon', 'Compliance'].map((tab) => (
            <TabsContent key={tab} value={tab} className="m-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {filterNotifications(tab).length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    filterNotifications(tab).map((notification) => {
                      const area = getAreaBadge(notification.notification_type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-primary' : 'bg-transparent'}`} />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge className={`${area.color} text-xs`}>
                                  {area.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                              {notification.action_url && (
                                <div className="flex items-center gap-1 text-xs text-primary mt-2">
                                  <ExternalLink className="h-3 w-3" />
                                  <span>View details</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
