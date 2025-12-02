import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Factory,
  Zap,
  Users,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SCOPE_1_CATEGORIES = [
  { value: "stationary_combustion", label: "Stationary Combustion (Boilers, Furnaces)" },
  { value: "mobile_combustion", label: "Mobile Combustion (Company Vehicles)" },
  { value: "fugitive_emissions", label: "Fugitive Emissions (Refrigerants, Leaks)" },
];

const SCOPE_2_CATEGORIES = [
  { value: "purchased_electricity", label: "Purchased Electricity" },
  { value: "purchased_steam", label: "Purchased Steam" },
  { value: "purchased_heating", label: "Purchased Heating" },
  { value: "purchased_cooling", label: "Purchased Cooling" },
];

const SCOPE_3_CATEGORIES = [
  { value: "purchased_goods_services", label: "Purchased Goods & Services" },
  { value: "capital_goods", label: "Capital Goods" },
  { value: "fuel_energy_related", label: "Fuel & Energy Related Activities" },
  { value: "upstream_transportation", label: "Upstream Transportation & Distribution" },
  { value: "waste_generated", label: "Waste Generated in Operations" },
  { value: "business_travel", label: "Business Travel" },
  { value: "employee_commuting", label: "Employee Commuting" },
  { value: "upstream_leased_assets", label: "Upstream Leased Assets" },
  { value: "downstream_transportation", label: "Downstream Transportation & Distribution" },
  { value: "processing_sold_products", label: "Processing of Sold Products" },
  { value: "use_sold_products", label: "Use of Sold Products" },
  { value: "end_of_life", label: "End-of-Life Treatment of Sold Products" },
  { value: "downstream_leased_assets", label: "Downstream Leased Assets" },
  { value: "franchises", label: "Franchises" },
  { value: "investments", label: "Investments" },
];

export default function EmissionSourcesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedScope, setSelectedScope] = useState(1);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  // Form state
  const [sourceName, setSourceName] = useState("");
  const [category, setCategory] = useState("");
  const [activityData, setActivityData] = useState("");
  const [activityUnit, setActivityUnit] = useState("");
  const [emissionFactor, setEmissionFactor] = useState("");
  const [dataSource, setDataSource] = useState("manual");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (user) {
      fetchSources();
    }
  }, [user, selectedScope]);

  const fetchSources = async () => {
    setLoading(true);
    try {
      // Use new API endpoint
      const response = await fetch(`/api/emissions/sources/scope${selectedScope}?companyId=${user?.id}`);

      if (response.ok) {
        const data = await response.json();
        setSources(data.sources || []);
      } else {
        // Fallback to direct Supabase query
        const { data, error } = await supabase
          .from("emission_sources")
          .select("*")
          .eq("user_id", user?.id)
          .eq("scope", selectedScope)
          .order("emission_amount", { ascending: false });

        if (error) throw error;
        setSources(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error loading sources",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (!sourceName || !category || !activityData || !emissionFactor) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const emissionAmount = parseFloat(activityData) * parseFloat(emissionFactor);

      const { error } = await supabase.from("emission_sources").insert({
        user_id: user?.id,
        scope: selectedScope,
        source_type: sourceName,
        category_name: category,
        activity_data: parseFloat(activityData),
        activity_unit: activityUnit,
        emission_factor: parseFloat(emissionFactor),
        emission_amount: emissionAmount,
        data_source: dataSource,
      });

      if (error) throw error;

      toast({ title: "Source added successfully" });
      setShowAddDialog(false);
      resetForm();
      fetchSources();
    } catch (error: any) {
      toast({
        title: "Error adding source",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return;

    try {
      const { error } = await supabase.from("emission_sources").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Source deleted successfully" });
      fetchSources();
    } catch (error: any) {
      toast({
        title: "Error deleting source",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSourceName("");
    setCategory("");
    setActivityData("");
    setActivityUnit("");
    setEmissionFactor("");
    setDataSource("manual");
    setDescription("");
  };

  const getCategoriesForScope = () => {
    switch (selectedScope) {
      case 1:
        return SCOPE_1_CATEGORIES;
      case 2:
        return SCOPE_2_CATEGORIES;
      case 3:
        return SCOPE_3_CATEGORIES;
      default:
        return [];
    }
  };

  const getScopeIcon = (scope: number) => {
    switch (scope) {
      case 1:
        return <Factory className="w-5 h-5" />;
      case 2:
        return <Zap className="w-5 h-5" />;
      case 3:
        return <Users className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getScopeColor = (scope: number) => {
    switch (scope) {
      case 1:
        return "text-red-500";
      case 2:
        return "text-orange-500";
      case 3:
        return "text-teal-500";
      default:
        return "";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Emission Sources Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your emission sources by scope
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchSources}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalculate
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </div>
        </div>

        <Tabs value={selectedScope.toString()} onValueChange={(v) => setSelectedScope(parseInt(v))}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1">
              <Factory className="w-4 h-4 mr-2" />
              Scope 1
            </TabsTrigger>
            <TabsTrigger value="2">
              <Zap className="w-4 h-4 mr-2" />
              Scope 2
            </TabsTrigger>
            <TabsTrigger value="3">
              <Users className="w-4 h-4 mr-2" />
              Scope 3
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedScope.toString()} className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">Loading sources...</div>
            ) : sources.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center ${getScopeColor(selectedScope)}`}>
                    {getScopeIcon(selectedScope)}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No sources added yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking emissions by adding your first Scope {selectedScope} source
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Source
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sources.map((source) => (
                <Card key={source.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${getScopeColor(selectedScope)}`}>
                          {getScopeIcon(selectedScope)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{source.source_type}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">
                            {source.category_name?.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{source.data_source}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedSource(expandedSource === source.id ? null : source.id)
                          }
                        >
                          {expandedSource === source.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSource(source.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Activity Amount</p>
                        <p className="text-lg font-semibold">
                          {(source.activityAmount || source.activity_data)?.toLocaleString()} {source.activityUnit || source.activity_unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Emission Factor</p>
                        <p className="text-lg font-semibold">
                          {(source.emissionFactor || source.emission_factor)?.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {source.emissionFactorUnit || 'kg CO₂e per unit'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total CO₂e</p>
                        <p className="text-lg font-bold text-primary">
                          {(source.totalCO2e || source.emission_amount)?.toFixed(2)} tons
                        </p>
                      </div>
                    </div>

                    {expandedSource === source.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Emission Factor Source: </span>
                            <Badge variant="secondary" className="ml-2">
                              {source.emissionFactorSource || source.emission_factor_source || 'EPA'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Calculation Method: </span>
                            <span className="font-medium">
                              {source.calculationMethod || source.calculation_method || 'activity_data × emission_factor'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Data Quality: </span>
                            <Badge variant="outline">
                              {source.dataQuality || source.data_quality || 'calculated'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Updated: </span>
                            <span>{new Date(source.createdAt || source.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {source.description && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Description: </span>
                            <span>{source.description}</span>
                          </div>
                        )}
                        {source.location && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Location: </span>
                            <span>{source.location}</span>
                          </div>
                        )}
                        {source.source_document_url && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Document: </span>
                            <a
                              href={source.source_document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Supporting Document
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Add Source Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Emission Source - Scope {selectedScope}</DialogTitle>
              <DialogDescription>
                Enter the details of your emission source. The system will calculate emissions
                automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Source Name *</Label>
                <Input
                  placeholder="e.g., Natural Gas - Factory A"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoriesForScope().map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Activity Data *</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={activityData}
                    onChange={(e) => setActivityData(e.target.value)}
                    step="0.01"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Unit *</Label>
                  <Input
                    placeholder="e.g., cubic meters, kWh"
                    value={activityUnit}
                    onChange={(e) => setActivityUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Emission Factor (kg CO2e per unit) *</Label>
                <Input
                  type="number"
                  placeholder="0.185"
                  value={emissionFactor}
                  onChange={(e) => setEmissionFactor(e.target.value)}
                  step="0.0001"
                />
                <p className="text-xs text-muted-foreground">
                  This will be auto-populated based on fuel type in production
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Data Source</Label>
                <Select value={dataSource} onValueChange={setDataSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="automated">Automated/Metered</SelectItem>
                    <SelectItem value="estimated">Estimated</SelectItem>
                    <SelectItem value="supplier">Supplier Provided</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activityData && emissionFactor && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Calculated Emissions:</p>
                  <p className="text-2xl font-bold text-primary">
                    {((parseFloat(activityData) * parseFloat(emissionFactor)) / 1000).toFixed(2)} tons
                    CO2e
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddSource} className="flex-1">
                  Add Source
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}