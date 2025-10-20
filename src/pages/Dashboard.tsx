import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { Activity, Trash2, ShieldCheck, DollarSign, Recycle, Leaf, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to ZERO, Acme Manufacturing</p>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Carbon Footprint"
            value="220K"
            trend={-12}
            trendLabel="vs last year"
            icon={<Activity className="w-5 h-5" />}
          />
          <MetricCard
            title="Waste Diverted"
            value="8,200"
            trend={15}
            trendLabel="tons this year"
            icon={<Trash2 className="w-5 h-5" />}
          />
          <MetricCard
            title="Compliance Status"
            value="87%"
            trend={5}
            trendLabel="completion rate"
            icon={<ShieldCheck className="w-5 h-5" />}
          />
          <MetricCard
            title="Cost Savings"
            value="$250K"
            trend={22}
            trendLabel="this quarter"
            icon={<DollarSign className="w-5 h-5" />}
          />
        </div>

        {/* Module Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModuleCard
            title="Circular Marketplace"
            description="Waste materials trading platform"
            icon={<Recycle className="w-6 h-6" />}
            metrics={[
              { label: "Active Transactions", value: "12" },
              { label: "Revenue Generated", value: "$45.2K" },
              { label: "Materials Listed", value: "28" },
            ]}
            route="/marketplace"
          />
          <ModuleCard
            title="Carbon Engine"
            description="Emission tracking & offset marketplace"
            icon={<Leaf className="w-6 h-6" />}
            metrics={[
              { label: "Total Emissions", value: "220K tons" },
              { label: "Scope 3 Coverage", value: "92%" },
              { label: "Offset Credits", value: "15K tons" },
            ]}
            route="/carbon"
          />
          <ModuleCard
            title="Compliance Autopilot"
            description="Automated regulatory reporting"
            icon={<FileCheck className="w-6 h-6" />}
            metrics={[
              { label: "CSRD Progress", value: "87%" },
              { label: "Next Deadline", value: "45 days" },
              { label: "Reports Generated", value: "8" },
            ]}
            route="/compliance"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "marketplace", title: "New waste transaction", description: "Steel scrap sold to Regional Recycling Co.", time: "2 hours ago", badge: "Completed" },
                { type: "carbon", title: "Carbon credit generated", description: "15 tons CO2e from circular transaction", time: "5 hours ago", badge: "Verified" },
                { type: "compliance", title: "CSRD milestone reached", description: "E5 metric auto-updated from marketplace data", time: "1 day ago", badge: "Auto-Updated" },
                { type: "marketplace", title: "AI match found", description: "Potential buyer for textile waste identified", time: "2 days ago", badge: "Pending" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {activity.type === "marketplace" && <Recycle className="w-5 h-5 text-primary" />}
                      {activity.type === "carbon" && <Leaf className="w-5 h-5 text-primary" />}
                      {activity.type === "compliance" && <FileCheck className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{activity.badge}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
