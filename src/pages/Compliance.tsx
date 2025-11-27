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
    case "green": return "bg-green-600";
    case "yellow": return "bg-yellow-500";
    case "red": return "bg-red-600";
    default: return "bg-neutral-400";
  }
};

const Compliance = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-neutral-900">Compliance Hub</h1>
              <p className="text-sm text-neutral-600 mt-1">Automated regulatory reporting and monitoring</p>
            </div>
            <Button size="sm" className="bg-neutral-900 hover:bg-neutral-800 text-white">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Frameworks Complete</p>
                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-light text-neutral-900">3</p>
            </CardContent>
          </Card>
          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">In Progress</p>
                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-light text-neutral-900">2</p>
            </CardContent>
          </Card>
          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Urgent Deadline</p>
                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-light text-neutral-900">1</p>
            </CardContent>
          </Card>
          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Reports Generated</p>
                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-neutral-600" />
                </div>
              </div>
              <p className="text-2xl font-light text-neutral-900">8</p>
            </CardContent>
          </Card>
        </div>

        {/* Regulatory Frameworks */}
        <Card className="border border-neutral-200 bg-white shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-neutral-900">Regulatory Frameworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {frameworks.map((framework) => (
                <div key={framework.name} className="p-4 border border-neutral-200 rounded hover:bg-neutral-50 transition-colors space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(framework.status)}`}></div>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900">{framework.name}</h4>
                        <p className="text-xs text-neutral-600">{framework.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs border-neutral-300 text-neutral-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {framework.deadline}
                      </Badge>
                      <span className="text-sm font-medium min-w-[3rem] text-right text-neutral-900">{framework.completion}%</span>
                    </div>
                  </div>
                  <Progress value={framework.completion} className="h-1.5" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8 border-neutral-300 text-neutral-900 hover:bg-neutral-50">View Details</Button>
                    <Button variant="outline" size="sm" className="text-xs h-8 border-neutral-300 text-neutral-900 hover:bg-neutral-50">Generate Report</Button>
                    {framework.completion < 100 && (
                      <Button variant="outline" size="sm" className="text-xs h-8 border-neutral-300 text-neutral-900 hover:bg-neutral-50">Add Data</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="border border-neutral-200 bg-white shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-neutral-900">Data Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-neutral-200 rounded space-y-2 bg-white">
                <p className="text-sm font-medium text-neutral-900">Circular Marketplace</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </div>
                <p className="text-xs text-neutral-600">Auto-updating waste metrics</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded space-y-2 bg-white">
                <p className="text-sm font-medium text-neutral-900">Carbon Engine</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </div>
                <p className="text-xs text-neutral-600">Real-time emission data</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded space-y-2 bg-white">
                <p className="text-sm font-medium text-neutral-900">ERP Systems</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">3 Systems Connected</span>
                </div>
                <p className="text-xs text-neutral-600">SAP, Oracle, Workday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Compliance;
