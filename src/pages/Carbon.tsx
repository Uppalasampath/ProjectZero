import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useState } from "react";

const Carbon = () => {
  const { user } = useAuth();
  const [trendPeriod, setTrendPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  // Fetch emissions summary using new API endpoint
  const { data: emissionsSummary, isLoading: emissionsLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['emissions-summary', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/emissions/summary?companyId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch emissions summary');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch emissions trend using new API endpoint
  const { data: emissionsTrend, refetch: refetchTrend } = useQuery({
    queryKey: ['emissions-trend', user?.id, trendPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/emissions/trend?companyId=${user?.id}&period=${trendPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch emissions trend');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Keep existing Supabase query for backward compatibility
  const { data: emissionsData } = useQuery({
    queryKey: ['carbon-emissions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carbon_emissions')
        .select('*')
        .eq('user_id', user?.id)
        .order('reporting_period_end', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch emission sources for top sources display
  const { data: emissionSources } = useQuery({
    queryKey: ['emission-sources', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emission_sources')
        .select('*')
        .eq('user_id', user?.id)
        .order('emission_amount', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch carbon credit purchases for offset total
  const { data: carbonCredits } = useQuery({
    queryKey: ['carbon-credits', user?.id],
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

  // Fetch user profile for net-zero target
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('net_zero_target_year')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate totals and derived data - prioritize API summary data
  const scope1Total = emissionsSummary?.scope1?.total || emissionsData?.scope_1_total || 0;
  const scope2Total = emissionsSummary?.scope2?.market_based || emissionsData?.scope_2_total || 0;
  const scope2LocationBased = emissionsSummary?.scope2?.location_based || 0;
  const scope3Total = emissionsSummary?.scope3?.total || emissionsData?.scope_3_total || 0;
  const totalEmissions = emissionsSummary?.grand_total || (scope1Total + scope2Total + scope3Total);

  const totalCarbonCredits = carbonCredits?.reduce((sum, credit) => sum + (credit.quantity_tons || 0), 0) || 0;

  const netZeroYear = profile?.net_zero_target_year || 2050;
  const currentYear = new Date().getFullYear();
  const yearsToTarget = netZeroYear - currentYear;
  const progressPercent = yearsToTarget > 0 ? Math.max(0, Math.min(100, ((totalCarbonCredits / totalEmissions) * 100))) : 100;

  // Prepare emission data for pie chart with market-based method
  const emissionData = [
    { name: "Scope 1 (Direct)", value: scope1Total, color: "hsl(var(--chart-1))" },
    { name: "Scope 2 (Market-Based)", value: scope2Total, color: "hsl(var(--chart-2))" },
    { name: "Scope 3 (Value Chain)", value: scope3Total, color: "hsl(var(--chart-3))" },
  ];

  // Parse scope 3 breakdown from API or fallback to legacy data
  const scope3Breakdown = useMemo(() => {
    // Prioritize API data
    if (emissionsSummary?.scope3?.categories) {
      return emissionsSummary.scope3.categories
        .map((cat: any) => ({
          category: cat.name || cat.category,
          emissions: Number(cat.total) || 0,
        }))
        .filter((cat: any) => cat.emissions > 0)
        .sort((a: any, b: any) => b.emissions - a.emissions);
    }

    // Fallback to legacy data
    if (!emissionsData?.scope_3_breakdown) return [];

    try {
      const breakdown = typeof emissionsData.scope_3_breakdown === 'string'
        ? JSON.parse(emissionsData.scope_3_breakdown)
        : emissionsData.scope_3_breakdown;

      return Object.entries(breakdown).map(([category, emissions]) => ({
        category,
        emissions: Number(emissions) || 0,
      }));
    } catch (e) {
      console.error('Error parsing scope 3 breakdown:', e);
      return [];
    }
  }, [emissionsSummary?.scope3?.categories, emissionsData?.scope_3_breakdown]);

  // Prepare top emission sources with percentages
  const topSources = useMemo(() => {
    if (!emissionSources || totalEmissions === 0) return [];

    return emissionSources.map(source => ({
      source: source.source_type || source.category_name || 'Unknown',
      emissions: source.emission_amount || 0,
      percentage: totalEmissions > 0 ? Math.round((source.emission_amount || 0) / totalEmissions * 100) : 0,
    }));
  }, [emissionSources, totalEmissions]);

  // Prepare emissions trend data from new API
  const emissionsTrendData = useMemo(() => {
    if (emissionsTrend?.data && emissionsTrend.data.length > 0) {
      return emissionsTrend.data;
    }
    return [];
  }, [emissionsTrend]);
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Carbon Engine</h1>
            <p className="text-muted-foreground mt-1">Track and reduce your carbon footprint</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                refetchSummary();
                refetchTrend();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalculate
            </Button>
            <Button className="bg-gradient-primary">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              {emissionsLoading ? (
                <div className="text-3xl font-bold text-muted-foreground">Loading...</div>
              ) : totalEmissions > 0 ? (
                <>
                  <div className="text-3xl font-bold">{totalEmissions.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">tons CO2e</p>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">No emissions data yet</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Zero Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{netZeroYear}</div>
              <Progress value={progressPercent} className="mt-3" />
              <p className="text-sm text-muted-foreground mt-2">{progressPercent.toFixed(0)}% progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCarbonCredits.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">tons offset</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Emissions by Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emissionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${(value / 1000).toFixed(0)}K`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {scope2LocationBased > 0 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    <strong>Scope 2 Methods:</strong> Market-Based: {scope2Total.toLocaleString()} tons CO₂e |
                    Location-Based: {scope2LocationBased.toLocaleString()} tons CO₂e
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Market-based method shown in chart (GHG Protocol recommended)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scope 3 Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {scope3Breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scope3Breakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="emissions" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No Scope 3 breakdown data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Emissions Trend Over Time */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Emissions Trend</CardTitle>
              <Select value={trendPeriod} onValueChange={(value: any) => setTrendPeriod(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {emissionsTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={emissionsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="scope1"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                    name="Scope 1"
                  />
                  <Area
                    type="monotone"
                    dataKey="scope2"
                    stackId="1"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                    name="Scope 2"
                  />
                  <Area
                    type="monotone"
                    dataKey="scope3"
                    stackId="1"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.6}
                    name="Scope 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No historical emissions data available. Add more emissions records to see trends.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Emission Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Top Emission Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {topSources.length > 0 ? (
              <div className="space-y-4">
                {topSources.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.source}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.emissions.toLocaleString()} tons ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No emission sources tracked yet. Add emission sources to see breakdown.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Carbon;
