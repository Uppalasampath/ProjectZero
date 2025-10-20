import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingDown, FileCheck, DollarSign, Leaf, CheckCircle2, Package, BarChart3, FileText } from "lucide-react";

export function ActivityFeed() {
  const activities = [
    {
      icon: <Package className="h-4 w-4" />,
      title: "Transaction Completed",
      description: "200 tons HDPE sold to Acme Recycling",
      time: "10 minutes ago",
      badge: "Marketplace",
      color: "text-primary bg-primary/10"
    },
    {
      icon: <TrendingDown className="h-4 w-4" />,
      title: "Emissions Reduced",
      description: "Scope 3 decreased by 50 tons CO2e",
      time: "25 minutes ago",
      badge: "Carbon",
      color: "text-success bg-success/10"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "CSRD E5-5 Updated",
      description: "Waste data auto-synced from marketplace",
      time: "1 hour ago",
      badge: "Compliance",
      color: "text-accent bg-accent/10"
    },
    {
      icon: <Leaf className="h-4 w-4" />,
      title: "Carbon Offset Purchased",
      description: "100 tons CO2e from reforestation project",
      time: "2 hours ago",
      badge: "Carbon",
      color: "text-success bg-success/10"
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      title: "Report Generated",
      description: "SB 253 compliance report completed",
      time: "Today at 9:30 AM",
      badge: "Compliance",
      color: "text-accent bg-accent/10"
    },
  ];

  return (
    <Card className="border-2 border-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Live updates across your sustainability platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{activity.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground/70">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
