import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";

const frameworks = [
  { name: "CSRD", fullName: "Corporate Sustainability Reporting Directive", completion: 87, status: "yellow", deadline: "45 days" },
  { name: "SB 253", fullName: "California Climate Disclosure", completion: 72, status: "yellow", deadline: "90 days" },
  { name: "CDP", fullName: "Carbon Disclosure Project", completion: 95, status: "green", deadline: "120 days" },
  { name: "TCFD", fullName: "Task Force on Climate-related Disclosures", completion: 68, status: "red", deadline: "30 days" },
  { name: "ISSB", fullName: "International Sustainability Standards Board", completion: 91, status: "green", deadline: "150 days" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "green": return "bg-success";
    case "yellow": return "bg-warning";
    case "red": return "bg-destructive";
    default: return "bg-muted";
  }
};

const Compliance = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Clean Header - Persefoni Style */}
        <div className="border-b border-border pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Compliance Autopilot</h1>
              <p className="text-sm text-muted-foreground mt-1">Automated regulatory reporting and monitoring</p>
            </div>
            <Button size="sm">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Overview Stats - Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-border shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Frameworks Complete</p>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-semibold text-foreground">3</p>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In Progress</p>
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <p className="text-2xl font-semibold text-foreground">2</p>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Urgent Deadline</p>
                <AlertCircle className="w-4 h-4 text-destructive" />
              </div>
              <p className="text-2xl font-semibold text-foreground">1</p>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reports Generated</p>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold text-foreground">8</p>
            </CardContent>
          </Card>
        </div>

        {/* Regulatory Frameworks */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Regulatory Frameworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {frameworks.map((framework) => (
                <div key={framework.name} className="p-4 border border-border rounded hover:bg-muted/30 transition-colors space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(framework.status)}`}></div>
                      <div>
                        <h4 className="text-sm font-medium">{framework.name}</h4>
                        <p className="text-xs text-muted-foreground">{framework.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {framework.deadline}
                      </Badge>
                      <span className="text-sm font-semibold min-w-[3rem] text-right">{framework.completion}%</span>
                    </div>
                  </div>
                  <Progress value={framework.completion} className="h-1.5" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8">View Details</Button>
                    <Button variant="outline" size="sm" className="text-xs h-8">Generate Report</Button>
                    {framework.completion < 100 && (
                      <Button variant="outline" size="sm" className="text-xs h-8">Add Data</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Data Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded space-y-2">
                <p className="text-sm font-medium text-foreground">Circular Marketplace</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">Connected</span>
                </div>
                <p className="text-xs text-muted-foreground">Auto-updating waste metrics</p>
              </div>
              <div className="p-4 border border-border rounded space-y-2">
                <p className="text-sm font-medium text-foreground">Carbon Engine</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">Connected</span>
                </div>
                <p className="text-xs text-muted-foreground">Real-time emission data</p>
              </div>
              <div className="p-4 border border-border rounded space-y-2">
                <p className="text-sm font-medium text-foreground">ERP Systems</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">3 Systems Connected</span>
                </div>
                <p className="text-xs text-muted-foreground">SAP, Oracle, Workday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Compliance;
