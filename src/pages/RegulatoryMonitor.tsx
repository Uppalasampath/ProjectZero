import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

const RegulatoryMonitor = () => {
  const updates = [
    {
      title: "CSRD Phase 2 Extension Announced",
      jurisdiction: "European Union",
      date: "2025-01-10",
      impact: "Medium",
      affectsYou: true,
      summary: "EU extends CSRD reporting deadline for mid-sized companies by 6 months. New deadline: December 31, 2025.",
      actions: ["Update compliance calendar", "Notify stakeholders"]
    },
    {
      title: "California SB 261 Final Rules Published",
      jurisdiction: "California, USA",
      date: "2025-01-05",
      impact: "High",
      affectsYou: true,
      summary: "Final climate-related financial risk disclosure requirements now effective. First reports due Q2 2025.",
      actions: ["Review new disclosure requirements", "Schedule TCFD alignment review", "Prepare Q2 submission"]
    },
    {
      title: "SEC Climate Disclosure Rule Update",
      jurisdiction: "United States",
      date: "2024-12-20",
      impact: "Low",
      affectsYou: false,
      summary: "SEC publishes guidance on Scope 3 emissions reporting exemptions for smaller filers.",
      actions: []
    },
    {
      title: "ISSB S2 Clarifications Released",
      jurisdiction: "Global",
      date: "2024-12-15",
      impact: "Medium",
      affectsYou: true,
      summary: "ISSB provides additional guidance on scenario analysis and climate-related metrics.",
      actions: ["Review scenario analysis methodology", "Update climate metrics"]
    },
    {
      title: "UK Sustainability Disclosure Standards",
      jurisdiction: "United Kingdom",
      date: "2024-12-01",
      impact: "Low",
      affectsYou: false,
      summary: "UK finalizes endorsement of ISSB standards with minor modifications for domestic use.",
      actions: []
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-destructive";
      case "Medium": return "bg-warning";
      case "Low": return "bg-muted";
      default: return "bg-muted";
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Regulatory Monitor</h1>
            <p className="text-muted-foreground mt-1">Stay updated on new regulations and changes</p>
          </div>
          <Button className="bg-gradient-primary">
            <Bell className="w-4 h-4 mr-2" />
            Configure Alerts
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alert Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email alerts for new regulations</Label>
                <p className="text-sm text-muted-foreground">Receive notifications when new rules affect your company</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>High-impact changes only</Label>
                <p className="text-sm text-muted-foreground">Only notify for regulations with high impact</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly digest</Label>
                <p className="text-sm text-muted-foreground">Summary of all updates every Friday</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {updates.map((update, index) => (
            <Card key={index} className={update.affectsYou ? "border-primary" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{update.title}</h3>
                      {update.affectsYou && (
                        <Badge className="bg-primary">Affects You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{update.jurisdiction}</span>
                      <span>•</span>
                      <span>{update.date}</span>
                    </div>
                  </div>
                  <Badge className={getImpactColor(update.impact)}>
                    {update.impact} Impact
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{update.summary}</p>

                {update.actions.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">What You Need to Do:</p>
                    <div className="space-y-1">
                      {update.actions.map((action, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-primary" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm">Create Task</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                )}

                {!update.affectsYou && (
                  <Button size="sm" variant="outline">View Details</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Regulatory Intelligence</h3>
                <p className="mb-4 opacity-90">
                  Our AI monitors 150+ regulatory bodies worldwide and automatically identifies changes 
                  relevant to your industry and operations.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold">48</p>
                    <p className="text-sm opacity-90">Active Regulations</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm opacity-90">Updates This Month</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm opacity-90">Action Items</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RegulatoryMonitor;
