import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Send, CheckCircle, AlertCircle } from "lucide-react";
import { REGULATORY_FRAMEWORKS } from "@/lib/compliance";

type FrameworkKey = 'SB-253' | 'CSRD' | 'CDP' | 'TCFD' | 'ISSB';

const ReportGeneration = () => {
  const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>('CSRD');

  // Get sections dynamically from the selected framework
  const reportSections = useMemo(() => {
    const framework = REGULATORY_FRAMEWORKS[selectedFramework];
    if (!framework) return [];

    // Simulate completion status - in production, this would come from actual data
    return framework.sections.map((section, index) => ({
      id: section.id,
      name: section.title,
      description: section.description,
      status: section.mandatory && Math.random() > 0.2 ? "complete" : (section.mandatory ? "incomplete" : "complete"),
      pages: section.estimatedPages,
      mandatory: section.mandatory,
      subsections: section.subsections
    }));
  }, [selectedFramework]);

  // Calculate overall completeness based on mandatory sections
  const completeness = useMemo(() => {
    const mandatorySections = reportSections.filter(s => s.mandatory);
    const completedMandatory = mandatorySections.filter(s => s.status === "complete");
    return mandatorySections.length > 0
      ? Math.round((completedMandatory.length / mandatorySections.length) * 100)
      : 100;
  }, [reportSections]);

  // Get framework-specific validation checks
  const validationChecks = useMemo(() => {
    const framework = REGULATORY_FRAMEWORKS[selectedFramework];
    const checks = [
      {
        check: "All mandatory disclosures included",
        status: completeness === 100
      },
      {
        check: "Data sources documented",
        status: true
      },
      {
        check: "Assurance-ready documentation",
        status: true
      }
    ];

    // Add framework-specific checks
    if (selectedFramework === 'SB-253') {
      checks.push({
        check: "Third-party assurance required",
        status: false
      });
      checks.push({
        check: "IPCC AR5 GWPs applied",
        status: true
      });
    } else if (selectedFramework === 'CSRD') {
      checks.push({
        check: "Double materiality assessment complete",
        status: true
      });
      checks.push({
        check: "XBRL tags applied (ESRS taxonomy)",
        status: false
      });
    } else if (selectedFramework === 'CDP') {
      checks.push({
        check: "All applicable Scope 3 categories reported",
        status: true
      });
    } else if (selectedFramework === 'TCFD') {
      checks.push({
        check: "Scenario analysis complete (2°C or lower)",
        status: true
      });
    } else if (selectedFramework === 'ISSB') {
      checks.push({
        check: "SASB industry-based metrics included",
        status: true
      });
      checks.push({
        check: "Climate transition plan disclosed",
        status: true
      });
    }

    return checks;
  }, [selectedFramework, completeness]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="border-b border-border pb-5">
          <h1 className="text-2xl font-semibold text-foreground">Generate Compliance Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create audit-ready regulatory reports • {REGULATORY_FRAMEWORKS[selectedFramework]?.fullName}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>Framework: <span className="font-semibold text-foreground">{selectedFramework}</span></span>
            <span>•</span>
            <span>Jurisdiction: <span className="font-semibold text-foreground">{REGULATORY_FRAMEWORKS[selectedFramework]?.jurisdiction}</span></span>
            <span>•</span>
            <span>Total Sections: <span className="font-semibold text-foreground">{reportSections.length}</span></span>
            <span>•</span>
            <span>Est. Pages: <span className="font-semibold text-foreground">{reportSections.reduce((sum, s) => sum + s.pages, 0)}</span></span>
          </div>
        </div>

        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Regulatory Framework</Label>
                <Select
                  value={selectedFramework}
                  onValueChange={(value) => setSelectedFramework(value as FrameworkKey)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSRD">CSRD (EU)</SelectItem>
                    <SelectItem value="SB-253">SB-253 (California)</SelectItem>
                    <SelectItem value="CDP">CDP Climate Change</SelectItem>
                    <SelectItem value="TCFD">TCFD</SelectItem>
                    <SelectItem value="ISSB">ISSB S1 & S2</SelectItem>
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
                        {section.description}
                      </p>
                      {section.subsections && section.subsections.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-foreground mb-2">Subsections:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {section.subsections.map((subsection: any) => (
                              <li key={subsection.id}>
                                {subsection.title} ({subsection.estimatedPages} {subsection.estimatedPages === 1 ? 'page' : 'pages'})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Checkbox defaultChecked={section.mandatory} />
                        <Label>
                          Include this section in report
                          {section.mandatory && <span className="text-destructive ml-1">*</span>}
                        </Label>
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
                {completeness === 100 ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : completeness >= 70 ? (
                  <AlertCircle className="w-5 h-5 text-warning" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                <span className="font-semibold">Overall Completeness</span>
              </div>
              <span className="text-xl font-bold">{completeness}%</span>
            </div>
            <div className="space-y-2">
              {validationChecks.map((item, index) => (
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
