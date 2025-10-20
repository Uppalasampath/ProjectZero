import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Recycle, Leaf, ShieldCheck, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function ActivityFeed() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const getActivityIcon = (actionType: string) => {
    if (actionType.includes('transaction') || actionType.includes('marketplace')) {
      return <Recycle className="h-5 w-5 text-blue-600" />;
    }
    if (actionType.includes('carbon') || actionType.includes('emission')) {
      return <Leaf className="h-5 w-5 text-green-600" />;
    }
    if (actionType.includes('compliance')) {
      return <ShieldCheck className="h-5 w-5 text-purple-600" />;
    }
    return <Activity className="h-5 w-5 text-gray-600" />;
  };

  const getModuleInfo = (actionType: string) => {
    if (actionType.includes('transaction') || actionType.includes('marketplace')) {
      return { name: "Module 1", color: "bg-blue-500" };
    }
    if (actionType.includes('carbon') || actionType.includes('emission')) {
      return { name: "Module 2", color: "bg-green-500" };
    }
    if (actionType.includes('compliance')) {
      return { name: "Module 3", color: "bg-purple-500" };
    }
    return { name: "System", color: "bg-gray-500" };
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => getModuleInfo(a.action_type).name === filter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="Module 1">Module 1</SelectItem>
              <SelectItem value="Module 2">Module 2</SelectItem>
              <SelectItem value="Module 3">Module 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const module = getModuleInfo(activity.action_type);
                const metadata = activity.metadata as any || {};
                const isCrossModule = metadata.module_1_to_2 || metadata.requirements_updated;

                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="mt-1">
                      {getActivityIcon(activity.action_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${module.color} text-white text-xs`}>
                          {module.name}
                        </Badge>
                        {isCrossModule && (
                          <Badge variant="outline" className="text-xs">
                            Cross-Module Sync
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      {metadata && (
                        <div className="text-xs text-muted-foreground">
                          {metadata.emission_reduction && (
                            <p>Emission reduction: {metadata.emission_reduction} tons CO2e</p>
                          )}
                          {metadata.requirements_updated && Array.isArray(metadata.requirements_updated) && (
                            <p>Updated: {metadata.requirements_updated.join(', ')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
