import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const emissionData = [
  { name: "Scope 1", value: 45000, color: "hsl(var(--chart-1))" },
  { name: "Scope 2", value: 55000, color: "hsl(var(--chart-2))" },
  { name: "Scope 3", value: 120000, color: "hsl(var(--chart-3))" },
];

const scope3Data = [
  { category: "Purchased Goods", emissions: 35000 },
  { category: "Logistics", emissions: 28000 },
  { category: "Business Travel", emissions: 15000 },
  { category: "Waste", emissions: 12000 },
  { category: "Employee Commuting", emissions: 10000 },
  { category: "Other", emissions: 20000 },
];

const Carbon = () => {
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
            <Button variant="outline">
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
              <div className="text-3xl font-bold">220,000</div>
              <p className="text-sm text-muted-foreground">tons CO2e</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Zero Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2045</div>
              <Progress value={35} className="mt-3" />
              <p className="text-sm text-muted-foreground mt-2">35% progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">15,000</div>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scope 3 Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scope3Data} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="emissions" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Emission Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Top Emission Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { source: "Purchased Goods & Services", emissions: 35000, percentage: 16 },
                { source: "Logistics & Transportation", emissions: 28000, percentage: 13 },
                { source: "Purchased Electricity", emissions: 55000, percentage: 25 },
                { source: "Natural Gas Facilities", emissions: 30000, percentage: 14 },
                { source: "Business Travel", emissions: 15000, percentage: 7 },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.source}</span>
                    <span className="text-sm text-muted-foreground">{item.emissions.toLocaleString()} tons ({item.percentage}%)</span>
                  </div>
                  <Progress value={item.percentage * 4} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Carbon;
