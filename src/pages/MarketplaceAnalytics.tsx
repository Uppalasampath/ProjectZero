import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  TrendingUp,
  Package,
  DollarSign,
  Leaf,
  Download,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function MarketplaceAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    totalMaterialsDiverted: 0,
    carbonCredits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch completed transactions where user is seller
      const { data: sellerTransactions, error: sellerError } = await supabase
        .from("transactions")
        .select("*")
        .eq("seller_id", user?.id)
        .eq("status", "completed");

      if (sellerError) throw sellerError;

      // Fetch buyer transactions
      const { data: buyerTransactions, error: buyerError } = await supabase
        .from("transactions")
        .select("*")
        .eq("buyer_id", user?.id)
        .eq("status", "completed");

      if (buyerError) throw buyerError;

      const allTransactions = [...(sellerTransactions || []), ...(buyerTransactions || [])];

      const totalRevenue = sellerTransactions?.reduce(
        (sum, t) => sum + (Number(t.total_amount) || 0),
        0
      ) || 0;

      const totalMaterialsDiverted = allTransactions.reduce(
        (sum, t) => sum + (Number(t.quantity) || 0),
        0
      );

      const carbonCredits = allTransactions.reduce(
        (sum, t) => sum + (Number(t.carbon_credits_generated) || 0),
        0
      );

      setStats({
        totalTransactions: allTransactions.length,
        totalRevenue,
        totalMaterialsDiverted,
        carbonCredits,
      });
    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    toast({ title: "Export feature coming soon!" });
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading analytics...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Marketplace Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your marketplace performance and impact
            </p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Completed deals</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From sales</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Materials Diverted</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMaterialsDiverted.toFixed(1)} tons</div>
              <p className="text-xs text-muted-foreground">From landfill</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Carbon Credits</CardTitle>
              <Leaf className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.carbonCredits.toFixed(1)} tons</div>
              <p className="text-xs text-muted-foreground">CO2e saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Placeholders */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Chart coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Materials Traded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Chart coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carbon Credits Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Chart coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Map coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}