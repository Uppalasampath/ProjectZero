import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Database, Plus } from "lucide-react";

const EmissionSources = () => {
  const scope1Sources = [
    { name: "Natural Gas - Facilities", emissions: 30000, trend: -8, source: "SAP ERP", updated: "2 hours ago" },
    { name: "Diesel - Company Vehicles", emissions: 15000, trend: 3, source: "Fleet Management", updated: "1 day ago" },
  ];

  const scope2Sources = [
    { name: "Purchased Electricity", emissions: 55000, trend: -12, source: "Oracle Utilities", updated: "1 hour ago" },
  ];

  const scope3Sources = [
    { name: "Purchased Goods & Services", emissions: 35000, trend: 5, source: "SAP ERP", updated: "3 hours ago" },
    { name: "Logistics & Transportation", emissions: 28000, trend: -15, source: "Workday", updated: "5 hours ago" },
    { name: "Business Travel", emissions: 15000, trend: -22, source: "Concur", updated: "1 day ago" },
    { name: "Waste Generated", emissions: 12000, trend: -30, source: "Marketplace Module", updated: "Real-time" },
    { name: "Employee Commuting", emissions: 10000, trend: 2, source: "HR System", updated: "1 week ago" },
  ];

  const SourceCard = ({ source }: { source: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">{source.name}</h3>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{source.source}</span>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit</Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{(source.emissions / 1000).toFixed(0)}K</span>
            <span className="text-sm text-muted-foreground">tons CO2e</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {source.trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-success" />
              ) : (
                <TrendingUp className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-sm font-medium ${source.trend < 0 ? 'text-success' : 'text-destructive'}`}>
                {Math.abs(source.trend)}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">vs last year</span>
          </div>
          
          <p className="text-xs text-muted-foreground">Updated: {source.updated}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Emission Sources</h1>
            <p className="text-muted-foreground mt-1">Manage and track all emission data sources</p>
          </div>
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Connect New Data Source
          </Button>
        </div>

        <Tabs defaultValue="scope1" className="space-y-6">
          <TabsList>
            <TabsTrigger value="scope1">Scope 1 (Direct)</TabsTrigger>
            <TabsTrigger value="scope2">Scope 2 (Indirect)</TabsTrigger>
            <TabsTrigger value="scope3">Scope 3 (Value Chain)</TabsTrigger>
          </TabsList>

          <TabsContent value="scope1" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Scope 1 Emissions</CardTitle>
                  <Badge variant="outline">45,000 tons CO2e</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Direct emissions from sources owned or controlled by your organization
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scope1Sources.map((source) => (
                    <SourceCard key={source.name} source={source} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scope2" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Scope 2 Emissions</CardTitle>
                  <Badge variant="outline">55,000 tons CO2e</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Indirect emissions from purchased electricity, steam, heating, and cooling
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scope2Sources.map((source) => (
                    <SourceCard key={source.name} source={source} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scope3" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Scope 3 Emissions</CardTitle>
                  <Badge variant="outline">120,000 tons CO2e</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  All indirect emissions across your value chain (15 categories)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scope3Sources.map((source) => (
                    <SourceCard key={source.name} source={source} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Available Integrations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["SAP", "Oracle", "Workday", "QuickBooks", "Salesforce", "Concur", "NetSuite", "Microsoft Dynamics"].map((system) => (
                <Button key={system} variant="outline" className="bg-white text-primary hover:bg-white/90">
                  {system}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EmissionSources;
