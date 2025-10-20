import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Activity, Trash2, ShieldCheck, DollarSign, Recycle, Leaf, FileCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cross-Module Impact Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cross-Module Impact</CardTitle>
              <CardDescription>Real-time synchronized data across all modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Circular Economy</p>
                    <Badge variant="outline" className="text-xs">Module 1 → 2, 3</Badge>
                  </div>
                  <p className="text-2xl font-bold">8,200 tons</p>
                  <p className="text-xs text-muted-foreground mt-1">Waste diverted • $3.2M revenue • Updated CSRD E5</p>
                </div>
                
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Climate Action</p>
                    <Badge variant="outline" className="text-xs">Module 2 → 3</Badge>
                  </div>
                  <p className="text-2xl font-bold">-22%</p>
                  <p className="text-xs text-muted-foreground mt-1">Scope 3 reduction • Auto-synced to all frameworks</p>
                </div>
                
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Compliance Reporting</p>
                    <Badge variant="outline" className="text-xs">Auto-populated</Badge>
                  </div>
                  <p className="text-2xl font-bold">68%</p>
                  <p className="text-xs text-muted-foreground mt-1">Data auto-populated from Modules 1 & 2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
