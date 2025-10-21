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
      <div className="space-y-8 animate-fade-in">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-eco p-10 text-primary-foreground shadow-warm">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-20 w-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Building2 className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-5xl font-bold tracking-tight">Welcome to ZERO</h1>
                <p className="text-xl text-primary-foreground/90 mt-2">
                  {profile?.company_name || 'Your Organization'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="text-sm opacity-90 mb-1">Net Zero Target</p>
                <p className="text-4xl font-bold">{profile?.net_zero_target_year || 2040}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="text-sm opacity-90 mb-1">Industry</p>
                <p className="text-2xl font-semibold">{profile?.industry || 'Manufacturing'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="text-sm opacity-90 mb-1">Progress</p>
                <p className="text-4xl font-bold">35%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                  -12% ↓
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Carbon Footprint</p>
              <p className="text-4xl font-bold">220K</p>
              <p className="text-xs text-muted-foreground mt-1">tons CO2e annually</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-success/5 to-success/10 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-success/20 flex items-center justify-center">
                  <Recycle className="h-7 w-7 text-success" />
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  +15% ↑
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Circular Economy</p>
              <p className="text-4xl font-bold">8.2K</p>
              <p className="text-xs text-muted-foreground mt-1">tons waste diverted</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-accent/5 to-accent/10 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-accent" />
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  On Track
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Compliance</p>
              <p className="text-4xl font-bold">87%</p>
              <p className="text-xs text-muted-foreground mt-1">frameworks complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Areas - Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModuleCard
            title="Circular Marketplace"
            description="Transform waste into revenue"
            icon={<Recycle className="w-6 h-6" />}
            metrics={[
              { label: "Active Listings", value: "28" },
              { label: "Revenue YTD", value: "$3.2M" },
            ]}
            route="/marketplace"
          />
          <ModuleCard
            title="Carbon Engine"
            description="Measure and reduce emissions"
            icon={<Leaf className="w-6 h-6" />}
            metrics={[
              { label: "Total Emissions", value: "220K tons" },
              { label: "Reduction Goal", value: "-45% by 2030" },
            ]}
            route="/carbon"
          />
          <ModuleCard
            title="Compliance Hub"
            description="Automated ESG reporting"
            icon={<FileCheck className="w-6 h-6" />}
            metrics={[
              { label: "CSRD Status", value: "87%" },
              { label: "Next Deadline", value: "45 days" },
            ]}
            route="/compliance"
          />
        </div>

        {/* Activity Section */}
        <ActivityFeed />
      </div>
    </Layout>
  );
};

export default Dashboard;
