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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compliance Autopilot</h1>
            <p className="text-muted-foreground mt-1">Automated regulatory reporting and monitoring</p>
          </div>
          <Button className="bg-gradient-primary">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Frameworks Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Urgent Deadline</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Reports Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regulatory Frameworks */}
        <Card>
          <CardHeader>
            <CardTitle>Regulatory Frameworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {frameworks.map((framework) => (
                <div key={framework.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(framework.status)}`}></div>
                      <div>
                        <h4 className="font-semibold">{framework.name}</h4>
                        <p className="text-sm text-muted-foreground">{framework.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {framework.deadline}
                      </Badge>
                      <span className="text-sm font-semibold">{framework.completion}%</span>
                    </div>
                  </div>
                  <Progress value={framework.completion} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Generate Report</Button>
                    {framework.completion < 100 && (
                      <Button variant="outline" size="sm">Add Data</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="bg-gradient-primary text-white">
          <CardHeader>
            <CardTitle>Data Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm opacity-90">Circular Marketplace</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Connected</span>
                </div>
                <p className="text-xs opacity-75">Auto-updating waste metrics</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm opacity-90">Carbon Engine</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Connected</span>
                </div>
                <p className="text-xs opacity-75">Real-time emission data</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm opacity-90">ERP Systems</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">3 Systems Connected</span>
                </div>
                <p className="text-xs opacity-75">SAP, Oracle, Workday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Compliance;
