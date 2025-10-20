import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, AlertCircle, Clock, Sparkles, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FrameworkDetail = () => {
  const navigate = useNavigate();

  const requirements = [
    { 
      id: "E1", 
      name: "Climate Change", 
      completion: 92, 
      status: "complete",
      dataPoints: 15,
      sources: ["Carbon Engine", "SAP ERP"]
    },
    { 
      id: "E2", 
      name: "Pollution", 
      completion: 78, 
      status: "in-progress",
      dataPoints: 12,
      sources: ["Oracle", "Manual Entry"]
    },
    { 
      id: "E3", 
      name: "Water & Marine Resources", 
      completion: 85, 
      status: "in-progress",
      dataPoints: 10,
      sources: ["SAP ERP"]
    },
    { 
      id: "E4", 
      name: "Biodiversity & Ecosystems", 
      completion: 65, 
      status: "incomplete",
      dataPoints: 8,
      sources: ["Manual Entry"]
    },
    { 
      id: "E5", 
      name: "Circular Economy", 
      completion: 95, 
      status: "complete",
      dataPoints: 14,
      sources: ["Marketplace Module", "SAP ERP"]
    },
    { 
      id: "S1", 
      name: "Own Workforce", 
      completion: 88, 
      status: "complete",
      dataPoints: 18,
      sources: ["Workday"]
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle className="w-5 h-5 text-success" />;
      case "in-progress": return <Clock className="w-5 h-5 text-warning" />;
      case "incomplete": return <AlertCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CSRD Framework</h1>
            <p className="text-muted-foreground mt-1">Corporate Sustainability Reporting Directive</p>
          </div>
          <Button className="bg-gradient-primary" onClick={() => navigate("/report-generation")}>
            Generate Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
              <p className="text-3xl font-bold">87%</p>
              <Progress value={87} className="mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Next Deadline</p>
              <p className="text-3xl font-bold">45 days</p>
              <p className="text-xs text-muted-foreground mt-2">June 30, 2025</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Data Points</p>
              <p className="text-3xl font-bold">77/92</p>
              <p className="text-xs text-muted-foreground mt-2">15 remaining</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Auto-Updated</p>
              <p className="text-3xl font-bold">68%</p>
              <p className="text-xs text-muted-foreground mt-2">From integrations</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Disclosure Requirements</CardTitle>
              <Button variant="outline" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Auto-fill from Modules
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {requirements.map((req) => (
                <AccordionItem key={req.id} value={req.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(req.status)}
                        <div className="text-left">
                          <p className="font-semibold">{req.id} - {req.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {req.sources.map((source) => (
                              <Badge key={source} variant="outline" className="text-xs">
                                <Database className="w-3 h-3 mr-1" />
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold">{req.completion}%</span>
                        <Progress value={req.completion} className="w-32" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 pr-4 pt-2 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {req.id === "E1" && "Disclose information on your climate change strategy, governance, risks, opportunities, and Scope 1, 2, and 3 GHG emissions."}
                        {req.id === "E2" && "Report on your pollution prevention and control measures, including air, water, and soil pollution."}
                        {req.id === "E3" && "Provide details on water consumption, marine resources impact, and conservation efforts."}
                        {req.id === "E4" && "Describe your impact on biodiversity and ecosystems, including land use changes."}
                        {req.id === "E5" && "Report on waste management, circular economy practices, and resource efficiency."}
                        {req.id === "S1" && "Disclose working conditions, health and safety, training, diversity, and human rights for your workforce."}
                      </p>
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground">Data Points Required</p>
                          <p className="font-semibold">{req.dataPoints}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Updated</p>
                          <p className="font-semibold">2 hours ago</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Completeness</p>
                          <p className="font-semibold">{req.completion}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data Sources</p>
                          <p className="font-semibold">{req.sources.length}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {req.completion < 100 && (
                          <Button size="sm" onClick={() => navigate("/data-collection")}>
                            Add Missing Data
                          </Button>
                        )}
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Export Section</Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gap Analysis & Priority Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { priority: "High", action: "Complete E4 biodiversity impact assessment", dueIn: "15 days" },
                { priority: "Medium", action: "Update E2 water pollution data from facilities", dueIn: "30 days" },
                { priority: "Low", action: "Add narrative descriptions to S1 training programs", dueIn: "45 days" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.priority === "High" ? "destructive" : item.priority === "Medium" ? "default" : "outline"}>
                      {item.priority}
                    </Badge>
                    <p className="font-semibold">{item.action}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Due in {item.dueIn}</span>
                    <Button size="sm">Assign</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FrameworkDetail;
