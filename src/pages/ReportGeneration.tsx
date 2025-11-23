import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Send, CheckCircle, AlertCircle } from "lucide-react";

const ReportGeneration = () => {
  const reportSections = [
    { id: "general", name: "General Information", status: "complete", pages: 5 },
    { id: "governance", name: "Governance", status: "complete", pages: 8 },
    { id: "e1", name: "E1: Climate Change", status: "complete", pages: 12 },
    { id: "e2", name: "E2: Pollution", status: "complete", pages: 9 },
    { id: "e3", name: "E3: Water & Marine", status: "complete", pages: 7 },
    { id: "e4", name: "E4: Biodiversity", status: "incomplete", pages: 6 },
    { id: "e5", name: "E5: Circular Economy", status: "complete", pages: 10 },
    { id: "s1", name: "S1: Own Workforce", status: "complete", pages: 15 },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="border-b border-border pb-5">
          <h1 className="text-2xl font-semibold text-foreground">Generate Compliance Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Create audit-ready regulatory reports</p>
        </div>

        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Regulatory Framework</Label>
                <Select defaultValue="csrd">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csrd">CSRD (EU)</SelectItem>
                    <SelectItem value="sb253">SB 253 (California)</SelectItem>
                    <SelectItem value="cdp">CDP Climate Change</SelectItem>
                    <SelectItem value="tcfd">TCFD</SelectItem>
                    <SelectItem value="issb">ISSB S1 & S2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reporting Period</Label>
                <Select defaultValue="fy2024">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fy2024">Fiscal Year 2024</SelectItem>
                    <SelectItem value="fy2023">Fiscal Year 2023</SelectItem>
                    <SelectItem value="q4-2024">Q4 2024</SelectItem>
                    <SelectItem value="custom">Custom Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Report Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["general", "e1"]} className="w-full">
              {reportSections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        {section.status === "complete" ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-warning" />
                        )}
                        <span className="font-semibold">{section.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{section.pages} pages</Badge>
                        <Badge className={section.status === "complete" ? "bg-success" : "bg-warning"}>
                          {section.status === "complete" ? "Complete" : "Incomplete"}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 pt-2 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {section.id === "e1" && "Complete emissions data across all three scopes, including historical trends and reduction targets."}
                        {section.id === "e4" && "Biodiversity assessment requires additional data on protected areas and restoration initiatives."}
                        {section.id === "e5" && "Waste management data auto-populated from Circular Marketplace transactions."}
                        {section.id.startsWith("e") && section.id !== "e1" && section.id !== "e4" && section.id !== "e5" && "All required disclosures completed with supporting documentation."}
                        {!section.id.startsWith("e") && "All required disclosures completed with supporting documentation."}
                      </p>
                      <div className="flex items-center gap-2">
                        <Checkbox defaultChecked />
                        <Label>Include this section in report</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Report Compliance Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-semibold">Overall Completeness</span>
              </div>
              <span className="text-xl font-bold">87%</span>
            </div>
            <div className="space-y-2">
              {[
                { check: "All mandatory disclosures included", status: true },
                { check: "Data sources documented", status: true },
                { check: "Assurance-ready documentation", status: true },
                { check: "Third-party verification complete", status: false },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {item.status ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-warning" />
                  )}
                  <span className={item.status ? "text-foreground" : "text-muted-foreground"}>
                    {item.check}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-16 flex flex-col gap-1.5 hover:bg-muted/50">
                <FileText className="w-5 h-5" />
                <span className="text-xs">PDF Report</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1.5 hover:bg-muted/50">
                <FileText className="w-5 h-5" />
                <span className="text-xs">XBRL Format</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1.5 hover:bg-muted/50">
                <FileText className="w-5 h-5" />
                <span className="text-xs">Excel Export</span>
              </Button>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button className="flex-1" variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Submit to Regulator
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-muted/30">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold mb-1.5">Third-Party Assurance</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Share your report with external auditors for limited or reasonable assurance.
            </p>
            <Button size="sm" variant="outline" className="h-8 text-xs">Generate Auditor Access Link</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportGeneration;
