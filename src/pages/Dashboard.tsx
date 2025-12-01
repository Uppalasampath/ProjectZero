import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Activity, Trash2, ShieldCheck, DollarSign, Recycle, Leaf, FileCheck, TrendingDown, Sparkles, Building2 } from "lucide-react";
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

  // Fetch latest carbon emissions data
  const { data: emissionsData } = useQuery({
    queryKey: ['carbon-emissions-latest', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carbon_emissions')
        .select('scope_1_total, scope_2_total, scope_3_total')
        .eq('user_id', user?.id)
        .order('reporting_period_end', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch carbon credit purchases for offset calculation
  const { data: carbonCredits } = useQuery({
    queryKey: ['carbon-credits-total', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carbon_credit_purchases')
        .select('quantity_tons')
        .eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch waste materials count
  const { data: wasteMaterials } = useQuery({
    queryKey: ['waste-materials-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('waste_materials')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'available');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch transactions for revenue and carbon credits calculation
  const { data: transactions } = useQuery({
    queryKey: ['transactions-revenue', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('total_amount, carbon_credits_generated')
        .or(`seller_id.eq.${user?.id},buyer_id.eq.${user?.id}`)
        .eq('status', 'completed');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate metrics
  const totalEmissions = (emissionsData?.scope_1_total || 0) +
                        (emissionsData?.scope_2_total || 0) +
                        (emissionsData?.scope_3_total || 0);

  const totalCarbonCredits = carbonCredits?.reduce((sum, credit) => sum + (credit.quantity_tons || 0), 0) || 0;

  // Calculate marketplace carbon credits from transactions
  const marketplaceCarbonCredits = transactions?.reduce((sum, t) => sum + (t.carbon_credits_generated || 0), 0) || 0;

  // Total carbon offsets including marketplace and purchased credits
  const totalOffsets = totalCarbonCredits + marketplaceCarbonCredits;
  const progressPercent = totalEmissions > 0 ? Math.min(100, (totalOffsets / totalEmissions) * 100) : 0;

  const totalRevenue = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-neutral-900 mb-1">
                {profile?.company_name || 'Your Organization'}
              </h1>
              <p className="text-sm text-neutral-600">
                {profile?.industry || 'Manufacturing'} • Target: Net Zero by {profile?.net_zero_target_year || 2040}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-neutral-500 mb-0.5">Progress to Net Zero</p>
                <p className="text-3xl font-light text-neutral-900">{progressPercent.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-neutral-200 bg-white shadow-none hover:border-neutral-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Carbon Footprint</p>
                  <p className="text-3xl font-light text-neutral-900">{totalEmissions > 0 ? formatNumber(totalEmissions) : '0'}</p>
                  <p className="text-xs text-neutral-600 mt-0.5">tons CO2e annually</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-neutral-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs mt-3 pt-3 border-t border-neutral-100">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">-12%</span>
                <span className="text-neutral-500">vs last year</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 bg-white shadow-none hover:border-neutral-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Circular Economy</p>
                  <p className="text-3xl font-light text-neutral-900">{marketplaceCarbonCredits > 0 ? `${formatNumber(marketplaceCarbonCredits)}` : '0'}</p>
                  <p className="text-xs text-neutral-600 mt-0.5">tons CO2e avoided</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Recycle className="h-5 w-5 text-neutral-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs mt-3 pt-3 border-t border-neutral-100">
                {totalRevenue > 0 ? (
                  <>
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">${formatNumber(totalRevenue)}</span>
                    <span className="text-neutral-500">revenue generated</span>
                  </>
                ) : (
                  <span className="text-neutral-500">No transactions yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 bg-white shadow-none hover:border-neutral-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Compliance</p>
                  <p className="text-3xl font-light text-neutral-900">87%</p>
                  <p className="text-xs text-neutral-600 mt-0.5">frameworks complete</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-neutral-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs mt-3 pt-3 border-t border-neutral-100">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-0 text-xs px-2 py-0">
                  On Track
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModuleCard
            title="Circular Marketplace"
            description="Transform waste into revenue"
            icon={<Recycle className="w-6 h-6" />}
            metrics={[
              { label: "Active Listings", value: wasteMaterials?.toString() || "0" },
              { label: "Revenue YTD", value: totalRevenue > 0 ? `$${formatNumber(totalRevenue)}` : "$0" },
            ]}
            route="/marketplace"
          />
          <ModuleCard
            title="Carbon Engine"
            description="Measure and reduce emissions"
            icon={<Leaf className="w-6 h-6" />}
            metrics={[
              { label: "Total Emissions", value: totalEmissions > 0 ? `${formatNumber(totalEmissions)} tons` : "0 tons" },
              { label: "Carbon Offsets", value: totalOffsets > 0 ? `${formatNumber(totalOffsets)} tons` : "0 tons" },
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
