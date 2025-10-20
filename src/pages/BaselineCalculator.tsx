import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Zap, TrendingUp, Clock, CheckCircle2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Choose Method", "Data Collection", "Review & Finalize"];

export default function BaselineCalculator() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [calculationMethod, setCalculationMethod] = useState("");
  const [loading, setLoading] = useState(false);

  // Data collection state
  const [naturalGas, setNaturalGas] = useState("");
  const [electricity, setElectricity] = useState("");
  const [fuelConsumption, setFuelConsumption] = useState("");
  const [annualSpend, setAnnualSpend] = useState("");

  const calculateBaseline = () => {
    // Simplified calculation for MVP
    const scope1 = parseFloat(naturalGas || "0") * 0.185 + parseFloat(fuelConsumption || "0") * 2.31;
    const scope2 = parseFloat(electricity || "0") * 0.385;
    const scope3 = parseFloat(annualSpend || "0") * 0.0005; // Rough spend-based estimate

    return {
      scope_1_total: scope1 / 1000, // Convert kg to tons
      scope_2_total: scope2 / 1000,
      scope_3_total: scope3,
      total: (scope1 + scope2) / 1000 + scope3,
    };
  };

  const handleSaveBaseline = async () => {
    setLoading(true);
    try {
      const results = calculateBaseline();
      const today = new Date();
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);

      const { error } = await supabase.from("carbon_emissions").insert({
        user_id: user?.id,
        reporting_period_start: yearStart.toISOString().split("T")[0],
        reporting_period_end: yearEnd.toISOString().split("T")[0],
        scope_1_total: results.scope_1_total,
        scope_2_total: results.scope_2_total,
        scope_3_total: results.scope_3_total,
        calculation_method: calculationMethod,
        data_quality_score: calculationMethod === "quick" ? 60 : calculationMethod === "hybrid" ? 80 : 95,
        verified: false,
      });

      if (error) throw error;

      toast({
        title: "Baseline saved successfully!",
        description: "Redirecting to your carbon dashboard...",
      });

      setTimeout(() => {
        navigate("/carbon/dashboard");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error saving baseline",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Choose Your Calculation Method</h2>
            <p className="text-muted-foreground">
              Select the approach that best fits your data availability and accuracy needs
            </p>

            <RadioGroup value={calculationMethod} onValueChange={setCalculationMethod}>
              <Card className={`cursor-pointer transition-all ${calculationMethod === "quick" ? "ring-2 ring-primary" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <RadioGroupItem value="quick" id="quick" className="mt-1" />
                    <div className="flex-1 ml-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <CardTitle>Quick Estimate (Spend-Based)</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get a baseline in 10 minutes using financial data. ±30% accuracy.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          10 min
                        </Badge>
                        <Badge variant="outline">Easy</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className={`cursor-pointer transition-all ${calculationMethod === "hybrid" ? "ring-2 ring-primary" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <RadioGroupItem value="hybrid" id="hybrid" className="mt-1" />
                    <div className="flex-1 ml-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <CardTitle>Hybrid Approach (Recommended)</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Combine spend data with key activity data. ±15% accuracy.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          30 min
                        </Badge>
                        <Badge variant="outline">Moderate</Badge>
                        <Badge className="bg-blue-500">Recommended</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className={`cursor-pointer transition-all ${calculationMethod === "detailed" ? "ring-2 ring-primary" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <RadioGroupItem value="detailed" id="detailed" className="mt-1" />
                    <div className="flex-1 ml-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <CardTitle>Detailed Assessment (Activity-Based)</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Most accurate, takes 1-2 hours. ±5% accuracy.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          1-2 hours
                        </Badge>
                        <Badge variant="outline">Advanced</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </RadioGroup>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Collect Your Data</h2>
            <p className="text-muted-foreground">
              {calculationMethod === "quick"
                ? "Enter your annual spend data for a quick estimate"
                : calculationMethod === "hybrid"
                ? "Provide key activity data for better accuracy"
                : "Provide detailed activity data across all scopes"}
            </p>

            {calculationMethod === "quick" && (
              <Card>
                <CardHeader>
                  <CardTitle>Annual Spend Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Annual Procurement Spend ($)</Label>
                    <Input
                      type="number"
                      placeholder="5000000"
                      value={annualSpend}
                      onChange={(e) => setAnnualSpend(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Annual Electricity Spend ($)</Label>
                    <Input type="number" placeholder="250000" />
                  </div>
                </CardContent>
              </Card>
            )}

            {(calculationMethod === "hybrid" || calculationMethod === "detailed") && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Scope 1: Direct Emissions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Annual Natural Gas Consumption (cubic meters)</Label>
                      <Input
                        type="number"
                        placeholder="50000"
                        value={naturalGas}
                        onChange={(e) => setNaturalGas(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Annual Fuel Consumption (liters)</Label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={fuelConsumption}
                        onChange={(e) => setFuelConsumption(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scope 2: Purchased Energy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Annual Electricity Consumption (kWh)</Label>
                      <Input
                        type="number"
                        placeholder="500000"
                        value={electricity}
                        onChange={(e) => setElectricity(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scope 3: Value Chain Emissions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Annual Procurement Spend ($)</Label>
                      <Input
                        type="number"
                        placeholder="5000000"
                        value={annualSpend}
                        onChange={(e) => setAnnualSpend(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll use spend-based factors for Scope 3
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        );

      case 2:
        const results = calculateBaseline();
        const accuracy =
          calculationMethod === "quick" ? 60 : calculationMethod === "hybrid" ? 80 : 95;

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review Your Baseline</h2>
            <p className="text-muted-foreground">
              Here's your calculated carbon footprint. You can refine this later by adding more detailed
              data.
            </p>

            <Card className="bg-gradient-primary text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-2">Total Carbon Footprint</p>
                  <p className="text-5xl font-bold mb-1">{results.total.toLocaleString()}</p>
                  <p className="text-lg opacity-90">tons CO2e per year</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Scope 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{results.scope_1_total.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">tons CO2e</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Scope 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{results.scope_2_total.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">tons CO2e</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Scope 3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{results.scope_3_total.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">tons CO2e</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Accuracy Level</span>
                  <Badge>{accuracy}%</Badge>
                </div>
                <Progress value={accuracy} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {accuracy < 70
                    ? "Estimated data based on spend. Add activity data to improve accuracy."
                    : accuracy < 90
                    ? "Good accuracy. You can further improve by adding detailed Scope 3 data."
                    : "High accuracy based on detailed activity data."}
                </p>
              </CardContent>
            </Card>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                This baseline will be saved as your FY {new Date().getFullYear()} emissions. You can refine
                it later by:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Adding more emission sources</li>
                <li>Uploading utility bills and invoices</li>
                <li>Engaging suppliers for Scope 3 data</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Carbon Baseline Calculator</h1>
          <div className="flex items-center gap-4">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm ${
                    index <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
                {index < STEPS.length - 1 && (
                  <div className="w-12 h-0.5 bg-muted mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 0 && !calculationMethod}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSaveBaseline} disabled={loading}>
              {loading ? "Saving..." : "Save Baseline & Continue"}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}