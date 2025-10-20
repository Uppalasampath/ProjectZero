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
        <div className="text-center py-12">Loading carbon data...</div>
      </Layout>
    );
  }

  if (!hasBaseline) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-12">
            <Leaf className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">Calculate Your Carbon Baseline</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get started by calculating your organization's carbon footprint. We'll guide you through
              the process step by step.
            </p>
            <Button size="lg" onClick={() => navigate("/carbon/baseline-calculator")}>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Carbon Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Period: {new Date(emissions.reporting_period_start).toLocaleDateString()} -{" "}
              {new Date(emissions.reporting_period_end).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchCarbonData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalculate
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Footprint</CardTitle>
              <Leaf className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getTotalEmissions().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">tons CO2e</p>
              <div className="flex items-center mt-2 text-xs">
                <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">8.2% vs last year</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scope 1</CardTitle>
              <Factory className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(emissions.scope_1_total || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {getScopePercentage("scope_1")}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scope 2</CardTitle>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(emissions.scope_2_total || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {getScopePercentage("scope_2")}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scope 3</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(emissions.scope_3_total || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {getScopePercentage("scope_3")}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Scope Breakdown Donut */}
          <Card>
            <CardHeader>
              <CardTitle>Emissions by Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Net Zero Target Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Emissions</span>
                  <span className="font-semibold">{getTotalEmissions().toLocaleString()} tons</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Target Year</span>
                  <span className="font-semibold">2040</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reduction Needed</span>
                  <span className="font-semibold text-orange-500">
                    {(getTotalEmissions() * 0.9).toLocaleString()} tons (90%)
                  </span>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-primary">
                      10% Progress
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-4 text-xs flex rounded bg-muted">
                  <div
                    style={{ width: "10%" }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-primary"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                You're slightly behind schedule. View recommendations to accelerate progress.
              </p>

              <Button className="w-full" onClick={() => navigate("/carbon/recommendations")}>
                View Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Emissions Timeline</CardTitle>
              <Tabs value={selectedScope} onValueChange={(v: any) => setSelectedScope(v)}>
                <TabsList>
                  <TabsTrigger value="all">All Scopes</TabsTrigger>
                  <TabsTrigger value="scope1">Scope 1</TabsTrigger>
                  <TabsTrigger value="scope2">Scope 2</TabsTrigger>
                  <TabsTrigger value="scope3">Scope 3</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {(selectedScope === "all" || selectedScope === "scope1") && (
                  <Line
                    type="monotone"
                    dataKey="scope1"
                    stroke={SCOPE_COLORS.scope1}
                    name="Scope 1"
                  />
                )}
                {(selectedScope === "all" || selectedScope === "scope2") && (
                  <Line
                    type="monotone"
                    dataKey="scope2"
                    stroke={SCOPE_COLORS.scope2}
                    name="Scope 2"
                  />
                )}
                {(selectedScope === "all" || selectedScope === "scope3") && (
                  <Line
                    type="monotone"
                    dataKey="scope3"
                    stroke={SCOPE_COLORS.scope3}
                    name="Scope 3"
                  />
                )}
                {selectedScope === "all" && (
                  <Line type="monotone" dataKey="total" stroke="#6366f1" name="Total" strokeWidth={2} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scope 3 Breakdown */}
        {scope3Breakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Scope 3 Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={scope3Breakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={200} />
                  <Tooltip />
                  <Bar dataKey="value" fill={SCOPE_COLORS.scope3} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Emission Sources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Emission Sources</CardTitle>
              <Button variant="outline" onClick={() => navigate("/carbon/sources")}>
                View All Sources
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSources.map((source, index) => (
                <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{source.source_type}</p>
                      <p className="text-sm text-muted-foreground">Scope {source.scope}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{Number(source.emission_amount || 0).toFixed(2)} tons</p>
                    <p className="text-sm text-muted-foreground">
                      {((Number(source.emission_amount) / getTotalEmissions()) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col"
                onClick={() => navigate("/carbon/sources")}
              >
                <Plus className="w-6 h-6 mb-2" />
                <span>Add Emission Source</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col"
                onClick={() => navigate("/offset-marketplace")}
              >
                <Leaf className="w-6 h-6 mb-2" />
                <span>Buy Carbon Offsets</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col"
                onClick={() => navigate("/carbon/suppliers")}
              >
                <Users className="w-6 h-6 mb-2" />
                <span>Engage Suppliers</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}