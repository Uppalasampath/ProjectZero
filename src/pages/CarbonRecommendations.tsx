import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  TrendingDown,
  Clock,
  DollarSign,
  Leaf,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  ArrowRight,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  reductionPotential: number; // tons CO2e
  reductionPercentage: number;
  implementationCost: number;
  annualSavings: number;
  paybackPeriod: number; // months
  difficulty: "easy" | "medium" | "hard";
  timeline: string; // e.g., "0-6 months"
  category: "energy" | "waste" | "logistics" | "suppliers" | "travel";
  details: string;
  steps: string[];
}

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "1",
    title: "Switch to 100% Renewable Energy",
    description:
      "Transition to renewable electricity through Power Purchase Agreements (PPAs) or Renewable Energy Certificates (RECs)",
    reductionPotential: 450,
    reductionPercentage: 18,
    implementationCost: 0,
    annualSavings: 12000,
    paybackPeriod: 0,
    difficulty: "easy",
    timeline: "0-6 months",
    category: "energy",
    details:
      "Renewable energy procurement can significantly reduce Scope 2 emissions while potentially reducing energy costs through long-term PPAs.",
    steps: [
      "Compare renewable energy options (PPAs, green tariffs, RECs)",
      "Request quotes from renewable energy providers",
      "Negotiate terms and sign agreement",
      "Update energy reporting and accounting",
    ],
  },
  {
    id: "2",
    title: "List Waste Materials on Circular Marketplace",
    description:
      "Divert industrial waste from landfills by selling on the platform, generating revenue and carbon credits",
    reductionPotential: 320,
    reductionPercentage: 13,
    implementationCost: 0,
    annualSavings: 45000,
    paybackPeriod: 0,
    difficulty: "easy",
    timeline: "0-6 months",
    category: "waste",
    details:
      "Your current Scope 3 Category 5 (Waste) emissions could be significantly reduced by diverting materials through Module 1.",
    steps: [
      "Identify waste streams suitable for resale",
      "List materials on Circular Marketplace",
      "Connect with buyers",
      "Track emissions avoided",
    ],
  },
  {
    id: "3",
    title: "Engage Top 20% of Suppliers",
    description:
      "Supplier engagement program targeting your highest-emission suppliers (covering 80% of Scope 3 Category 1)",
    reductionPotential: 580,
    reductionPercentage: 23,
    implementationCost: 15000,
    annualSavings: 0,
    paybackPeriod: 0,
    difficulty: "medium",
    timeline: "6-12 months",
    category: "suppliers",
    details:
      "Scope 3 Category 1 represents your largest emission source. Working with top suppliers can drive significant reductions.",
    steps: [
      "Identify top 20% suppliers by emissions",
      "Send sustainability assessments",
      "Review supplier data and set targets",
      "Collaborate on reduction initiatives",
    ],
  },
  {
    id: "4",
    title: "Optimize Logistics Routes",
    description:
      "Implement route optimization software and consider mode switching from air to ocean freight where possible",
    reductionPotential: 180,
    reductionPercentage: 7,
    implementationCost: 25000,
    annualSavings: 35000,
    paybackPeriod: 8,
    difficulty: "medium",
    timeline: "3-9 months",
    category: "logistics",
    details:
      "Transportation emissions can be reduced through better planning and mode optimization without compromising delivery times.",
    steps: [
      "Audit current transportation practices",
      "Evaluate route optimization software",
      "Analyze mode switching opportunities",
      "Implement and track savings",
    ],
  },
  {
    id: "5",
    title: "LED Lighting & Energy Efficiency Upgrades",
    description:
      "Replace traditional lighting with LED and upgrade HVAC systems with energy-efficient models",
    reductionPotential: 95,
    reductionPercentage: 4,
    implementationCost: 50000,
    annualSavings: 18000,
    paybackPeriod: 33,
    difficulty: "easy",
    timeline: "3-6 months",
    category: "energy",
    details:
      "Quick wins in facility energy efficiency can reduce both emissions and operating costs with proven ROI.",
    steps: [
      "Conduct energy audit",
      "Get quotes for LED retrofit",
      "Plan upgrade schedule to minimize disruption",
      "Install and commission new systems",
    ],
  },
  {
    id: "6",
    title: "Reduce Business Travel Emissions",
    description:
      "Implement video conferencing, shift to rail travel, and offset remaining flights",
    reductionPotential: 75,
    reductionPercentage: 3,
    implementationCost: 5000,
    annualSavings: 25000,
    paybackPeriod: 2,
    difficulty: "easy",
    timeline: "0-3 months",
    category: "travel",
    details:
      "Business travel emissions can be reduced through policy changes and better alternatives without impacting business needs.",
    steps: [
      "Update travel policy to prioritize alternatives",
      "Invest in video conferencing technology",
      "Analyze travel patterns for optimization",
      "Offset remaining necessary travel",
    ],
  },
];

export default function CarbonRecommendations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [recommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedForSimulation, setSelectedForSimulation] = useState<Set<string>>(new Set());
  const [currentEmissions, setCurrentEmissions] = useState(2500); // Mock current emissions

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const toggleSimulation = (id: string) => {
    const newSet = new Set(selectedForSimulation);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedForSimulation(newSet);
  };

  const getTotalReduction = () => {
    return recommendations
      .filter(r => selectedForSimulation.has(r.id))
      .reduce((sum, r) => sum + r.reductionPotential, 0);
  };

  const getTotalCost = () => {
    return recommendations
      .filter(r => selectedForSimulation.has(r.id))
      .reduce((sum, r) => sum + r.implementationCost, 0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "energy":
        return <Zap className="w-4 h-4" />;
      case "waste":
        return <Leaf className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const quickWins = recommendations.filter(r => r.timeline.includes("0-6"));
  const mediumTerm = recommendations.filter(r => r.timeline.includes("6-12") || r.timeline.includes("6-24"));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Decarbonization Recommendations</h1>
          <p className="text-muted-foreground mt-1">
            Your personalized roadmap to reach net zero by 2040
          </p>
        </div>

        {/* Target Card */}
        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Target Reduction Needed</p>
                <p className="text-4xl font-bold">2,250 tons CO2e</p>
                <p className="text-sm opacity-90 mt-1">to reach net zero by 2040</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <div>
                    <p className="text-3xl font-bold">90%</p>
                    <p className="text-xs">reduction</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Simulator */}
        <Card>
          <CardHeader>
            <CardTitle>Impact Simulator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select recommendations below to see their combined impact on your emissions
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Selected Actions</p>
                <p className="text-2xl font-bold">{selectedForSimulation.size}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Reduction</p>
                <p className="text-2xl font-bold text-green-500">-{getTotalReduction()} tons</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Investment</p>
                <p className="text-2xl font-bold">${getTotalCost().toLocaleString()}</p>
              </div>
            </div>
            {selectedForSimulation.size > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-2">Projected Impact:</p>
                <p className="text-lg font-bold text-green-600">
                  Emissions would drop from {currentEmissions} to{" "}
                  {currentEmissions - getTotalReduction()} tons CO2e (
                  {((getTotalReduction() / currentEmissions) * 100).toFixed(1)}% reduction)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="quick">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">Quick Wins (0-6 months)</TabsTrigger>
            <TabsTrigger value="medium">Medium-Term (6-24 months)</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4 mt-6">
            {quickWins.map((rec) => (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedForSimulation.has(rec.id)}
                          onChange={() => toggleSimulation(rec.id)}
                          className="w-5 h-5 rounded"
                        />
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(rec.category)}
                          <CardTitle className="text-xl">{rec.title}</CardTitle>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">{rec.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(rec.id)}
                    >
                      {expandedIds.has(rec.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Reduction</p>
                      <p className="font-bold text-green-600">
                        -{rec.reductionPotential} tons
                      </p>
                      <p className="text-xs text-muted-foreground">{rec.reductionPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cost</p>
                      <p className="font-bold">
                        {rec.implementationCost === 0
                          ? "Free"
                          : `$${rec.implementationCost.toLocaleString()}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Annual Savings</p>
                      <p className="font-bold text-green-600">
                        ${rec.annualSavings.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payback</p>
                      <p className="font-bold">
                        {rec.paybackPeriod === 0
                          ? "Immediate"
                          : `${rec.paybackPeriod} months`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                      <Badge className={getDifficultyColor(rec.difficulty)} variant="outline">
                        {rec.difficulty}
                      </Badge>
                    </div>
                  </div>

                  {expandedIds.has(rec.id) && (
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <p className="font-semibold mb-2">Details:</p>
                        <p className="text-sm text-muted-foreground">{rec.details}</p>
                      </div>

                      <div>
                        <p className="font-semibold mb-2">Implementation Steps:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          {rec.steps.map((step, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="flex gap-3">
                        <Button className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Start Initiative
                        </Button>
                        {rec.category === "waste" && (
                          <Button
                            variant="outline"
                            onClick={() => navigate("/list-waste")}
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            List Waste Now
                          </Button>
                        )}
                        {rec.category === "suppliers" && (
                          <Button
                            variant="outline"
                            onClick={() => navigate("/carbon/suppliers")}
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Engage Suppliers
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="medium" className="space-y-4 mt-6">
            {mediumTerm.map((rec) => (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedForSimulation.has(rec.id)}
                          onChange={() => toggleSimulation(rec.id)}
                          className="w-5 h-5 rounded"
                        />
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(rec.category)}
                          <CardTitle className="text-xl">{rec.title}</CardTitle>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">{rec.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(rec.id)}
                    >
                      {expandedIds.has(rec.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Reduction</p>
                      <p className="font-bold text-green-600">
                        -{rec.reductionPotential} tons
                      </p>
                      <p className="text-xs text-muted-foreground">{rec.reductionPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cost</p>
                      <p className="font-bold">
                        {rec.implementationCost === 0
                          ? "Free"
                          : `$${rec.implementationCost.toLocaleString()}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Annual Savings</p>
                      <p className="font-bold text-green-600">
                        {rec.annualSavings > 0
                          ? `$${rec.annualSavings.toLocaleString()}`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payback</p>
                      <p className="font-bold">
                        {rec.paybackPeriod === 0
                          ? "Immediate"
                          : `${rec.paybackPeriod} months`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                      <Badge className={getDifficultyColor(rec.difficulty)} variant="outline">
                        {rec.difficulty}
                      </Badge>
                    </div>
                  </div>

                  {expandedIds.has(rec.id) && (
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <p className="font-semibold mb-2">Details:</p>
                        <p className="text-sm text-muted-foreground">{rec.details}</p>
                      </div>

                      <div>
                        <p className="font-semibold mb-2">Implementation Steps:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          {rec.steps.map((step, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <Button className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Start Initiative
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}