import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Activity, Trash2, ShieldCheck, DollarSign, Recycle, Leaf, FileCheck, TrendingUp, Sparkles, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-eco p-8 text-primary-foreground shadow-eco">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Welcome back to ZERO</h1>
                <p className="text-lg text-primary-foreground/90 mt-2">
                  {profile?.company_name || 'Your Organization'} • {profile?.industry || 'Manufacturing'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 animate-pulse" />
              <div className="text-right">
                <p className="text-sm opacity-90">Net Zero Target</p>
                <p className="text-3xl font-bold">{profile?.net_zero_target_year || 2040}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Metrics with Eco Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 hover:shadow-eco transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                  -12% ↓
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Carbon Footprint</p>
              <p className="text-3xl font-bold">220K</p>
              <p className="text-xs text-muted-foreground mt-1">tons CO2e annually</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/30 bg-gradient-to-br from-success/10 to-chart-4/5 hover:shadow-eco transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-success" />
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  +15% ↑
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Waste Diverted</p>
              <p className="text-3xl font-bold">8,200</p>
              <p className="text-xs text-muted-foreground mt-1">tons this year via marketplace</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-primary/5 hover:shadow-eco transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  +5% ↑
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Compliance Status</p>
              <p className="text-3xl font-bold">87%</p>
              <p className="text-xs text-muted-foreground mt-1">CSRD & CDP completion</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-chart-2/30 bg-gradient-to-br from-chart-2/10 to-success/5 hover:shadow-eco transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-chart-2" />
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  +22% ↑
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Cost Savings</p>
              <p className="text-3xl font-bold">$250K</p>
              <p className="text-xs text-muted-foreground mt-1">this quarter from initiatives</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Capabilities Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModuleCard
            title="Circular Marketplace"
            description="Turn waste into revenue streams"
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
            description="Track, reduce, and offset emissions"
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
            description="Automated ESG & regulatory reporting"
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
          {/* Integrated Platform Impact */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Integrated Impact Dashboard
              </CardTitle>
              <CardDescription>Real-time data synchronization across your sustainability platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border-l-4 border-success bg-success/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Circular Economy Impact</p>
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      Live Data
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">8,200 tons</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Waste diverted • $3.2M revenue • CSRD E5 automatically updated
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border-l-4 border-primary bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Carbon Footprint Reduction</p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Live Data
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">-22%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scope 3 emissions reduced • All frameworks auto-synced
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border-l-4 border-accent bg-accent/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Compliance Automation</p>
                    <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                      Auto-populated
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">68%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Framework completion • Data pulled from marketplace & carbon tracking
                  </p>
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
