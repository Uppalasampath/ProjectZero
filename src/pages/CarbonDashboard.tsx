import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  Factory,
  Zap,
  Users,
  Target,
  Download,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SCOPE_COLORS = {
  scope1: "#ef4444",
  scope2: "#f97316",
  scope3: "#14b8a6",
};

export default function CarbonDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [hasBaseline, setHasBaseline] = useState(false);
  const [emissions, setEmissions] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [topSources, setTopSources] = useState<any[]>([]);
  const [scope3Breakdown, setScope3Breakdown] = useState<any[]>([]);
  const [selectedScope, setSelectedScope] = useState<"all" | "scope1" | "scope2" | "scope3">("all");

  useEffect(() => {
    if (user) {
      fetchCarbonData();
    }
  }, [user]);

  const fetchCarbonData = async () => {
    try {
      // Fetch latest emissions
      const { data: emissionsData, error: emissionsError } = await supabase
        .from("carbon_emissions")
        .select("*")
        .eq("user_id", user?.id)
        .order("reporting_period_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (emissionsError) throw emissionsError;

      if (!emissionsData) {
        setHasBaseline(false);
        setLoading(false);
        return;
      }

      setHasBaseline(true);
      setEmissions(emissionsData);

      // Fetch historical data (last 12 months)
      const { data: historicalData } = await supabase
        .from("carbon_emissions")
        .select("*")
        .eq("user_id", user?.id)
        .order("reporting_period_start", { ascending: true })
        .limit(12);

      if (historicalData) {
        const formattedHistory = historicalData.map((record) => ({
          month: new Date(record.reporting_period_start).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          scope1: Number(record.scope_1_total) || 0,
          scope2: Number(record.scope_2_total) || 0,
          scope3: Number(record.scope_3_total) || 0,
          total:
            (Number(record.scope_1_total) || 0) +
            (Number(record.scope_2_total) || 0) +
            (Number(record.scope_3_total) || 0),
        }));
        setHistoricalData(formattedHistory);
      }

      // Fetch top emission sources
      const { data: sourcesData } = await supabase
        .from("emission_sources")
        .select("*")
        .eq("user_id", user?.id)
        .order("emission_amount", { ascending: false })
        .limit(10);

      if (sourcesData) {
        setTopSources(sourcesData);
      }

      // Parse Scope 3 breakdown
      if (emissionsData.scope_3_breakdown) {
        const breakdown = Object.entries(emissionsData.scope_3_breakdown).map(
          ([category, value]: any) => ({
            category,
            value: Number(value) || 0,
          })
        );
        setScope3Breakdown(breakdown.sort((a, b) => b.value - a.value));
      }
    } catch (error: any) {
      toast({
        title: "Error loading carbon data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalEmissions = () => {
    if (!emissions) return 0;
    return (
      (Number(emissions.scope_1_total) || 0) +
      (Number(emissions.scope_2_total) || 0) +
      (Number(emissions.scope_3_total) || 0)
    );
  };

  const getScopePercentage = (scope: "scope_1" | "scope_2" | "scope_3") => {
    const total = getTotalEmissions();
    if (total === 0) return 0;
    const scopeValue = Number(emissions?.[`${scope}_total`]) || 0;
    return ((scopeValue / total) * 100).toFixed(1);
  };

  const pieData = [
    { name: "Scope 1", value: Number(emissions?.scope_1_total) || 0, color: SCOPE_COLORS.scope1 },
    { name: "Scope 2", value: Number(emissions?.scope_2_total) || 0, color: SCOPE_COLORS.scope2 },
    { name: "Scope 3", value: Number(emissions?.scope_3_total) || 0, color: SCOPE_COLORS.scope3 },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-neutral-600">Loading carbon data...</div>
      </Layout>
    );
  }

  if (!hasBaseline) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-12 border border-neutral-200 bg-white shadow-none">
            <Leaf className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-light mb-2 text-neutral-900">Calculate Your Carbon Baseline</h2>
            <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
              Get started by calculating your organization's carbon footprint. We'll guide you through
              the process step by step.
            </p>
            <Button size="lg" onClick={() => navigate("/carbon/baseline-calculator")} className="bg-neutral-900 hover:bg-neutral-800 text-white">
              Start Baseline Calculation
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-neutral-900">Carbon Dashboard</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {new Date(emissions.reporting_period_start).toLocaleDateString()} - {new Date(emissions.reporting_period_end).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchCarbonData} className="border-neutral-300 text-neutral-900 hover:bg-neutral-50">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="border-neutral-300 text-neutral-900 hover:bg-neutral-50">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Footprint</p>
                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-neutral-600" />
                </div>
              </div>
              <div className="text-2xl font-light text-neutral-900">{getTotalEmissions().toLocaleString()}</div>
              <p className="text-xs text-neutral-600 mt-0.5">tons CO2e</p>
              <div className="flex items-center mt-3 pt-3 border-t border-neutral-100">
                <TrendingDown className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">8.2%</span>
                <span className="text-xs text-neutral-500 ml-1">vs last year</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Scope 1</p>
                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-neutral-600" />
                </div>
              </div>
              <div className="text-2xl font-light text-neutral-900">
                {Number(emissions.scope_1_total || 0).toLocaleString()}
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                {getScopePercentage("scope_1")}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Scope 2</p>
                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-neutral-600" />
                </div>
              </div>
              <div className="text-2xl font-light text-neutral-900">
                {Number(emissions.scope_2_total || 0).toLocaleString()}
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                {getScopePercentage("scope_2")}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Scope 3</p>
                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-neutral-600" />
                </div>
              </div>
              <div className="text-2xl font-light text-neutral-900">
                {Number(emissions.scope_3_total || 0).toLocaleString()}
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                {getScopePercentage("scope_3")}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Scope Breakdown Donut */}
          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-neutral-900">Emissions by Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Target Progress */}
          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-neutral-900 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Net Zero Target Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 pb-3 border-b border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Current Emissions</span>
                  <span className="font-medium text-neutral-900">{getTotalEmissions().toLocaleString()} tons</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Target Year</span>
                  <span className="font-medium text-neutral-900">2040</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Reduction Needed</span>
                  <span className="font-medium text-orange-600">
                    {(getTotalEmissions() * 0.9).toLocaleString()} tons (90%)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Progress</span>
                  <span className="font-medium text-neutral-900">10%</span>
                </div>
                <div className="overflow-hidden h-2 rounded-full bg-neutral-100">
                  <div
                    style={{ width: "10%" }}
                    className="h-full bg-neutral-900 transition-all"
                  />
                </div>
              </div>

              <p className="text-xs text-neutral-600 pt-2">
                You're slightly behind schedule. View recommendations to accelerate progress.
              </p>

              <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white" size="sm" onClick={() => navigate("/carbon/recommendations")}>
                View Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Chart */}
        <Card className="border border-neutral-200 bg-white shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-neutral-900">Emissions Timeline</CardTitle>
              <Tabs value={selectedScope} onValueChange={(v: any) => setSelectedScope(v)}>
                <TabsList className="h-8 bg-neutral-100">
                  <TabsTrigger value="all" className="text-xs px-2.5 data-[state=active]:bg-white">All Scopes</TabsTrigger>
                  <TabsTrigger value="scope1" className="text-xs px-2.5 data-[state=active]:bg-white">Scope 1</TabsTrigger>
                  <TabsTrigger value="scope2" className="text-xs px-2.5 data-[state=active]:bg-white">Scope 2</TabsTrigger>
                  <TabsTrigger value="scope3" className="text-xs px-2.5 data-[state=active]:bg-white">Scope 3</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#737373" />
                <YAxis tick={{ fontSize: 11 }} stroke="#737373" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {(selectedScope === "all" || selectedScope === "scope1") && (
                  <Line
                    type="monotone"
                    dataKey="scope1"
                    stroke={SCOPE_COLORS.scope1}
                    name="Scope 1"
                    strokeWidth={2}
                  />
                )}
                {(selectedScope === "all" || selectedScope === "scope2") && (
                  <Line
                    type="monotone"
                    dataKey="scope2"
                    stroke={SCOPE_COLORS.scope2}
                    name="Scope 2"
                    strokeWidth={2}
                  />
                )}
                {(selectedScope === "all" || selectedScope === "scope3") && (
                  <Line
                    type="monotone"
                    dataKey="scope3"
                    stroke={SCOPE_COLORS.scope3}
                    name="Scope 3"
                    strokeWidth={2}
                  />
                )}
                {selectedScope === "all" && (
                  <Line type="monotone" dataKey="total" stroke="#171717" name="Total" strokeWidth={2} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scope 3 Breakdown */}
        {scope3Breakdown.length > 0 && (
          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-neutral-900">Scope 3 Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={scope3Breakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#737373" />
                  <YAxis dataKey="category" type="category" width={180} tick={{ fontSize: 10 }} stroke="#737373" />
                  <Tooltip />
                  <Bar dataKey="value" fill={SCOPE_COLORS.scope3} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Emission Sources */}
        <Card className="border border-neutral-200 bg-white shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-neutral-900">Top Emission Sources</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/carbon/sources")} className="border-neutral-300 text-neutral-900 hover:bg-neutral-50">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSources.map((source, index) => (
                <div key={source.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-medium text-neutral-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{source.source_type}</p>
                      <p className="text-xs text-neutral-600">Scope {source.scope}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">{Number(source.emission_amount || 0).toFixed(2)} tons</p>
                    <p className="text-xs text-neutral-600">
                      {((Number(source.emission_amount) / getTotalEmissions()) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-neutral-200 bg-white shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-neutral-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-neutral-50 border-neutral-300 text-neutral-900"
                onClick={() => navigate("/carbon/sources")}
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm">Add Emission Source</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-neutral-50 border-neutral-300 text-neutral-900"
                onClick={() => navigate("/offset-marketplace")}
              >
                <Leaf className="w-5 h-5" />
                <span className="text-sm">Buy Carbon Offsets</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-neutral-50 border-neutral-300 text-neutral-900"
                onClick={() => navigate("/carbon/suppliers")}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm">Engage Suppliers</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
