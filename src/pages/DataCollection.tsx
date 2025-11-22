import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Upload, Users } from "lucide-react";

const DataCollection = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="border-b border-border pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Data Collection</h1>
              <p className="text-sm text-muted-foreground mt-1">CSRD E4: Biodiversity & Ecosystems</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">Overall Progress</p>
              <p className="text-2xl font-semibold text-foreground">65%</p>
            </div>
          </div>
        </div>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-5">
            <Progress value={65} className="mb-2 h-2" />
            <p className="text-xs text-muted-foreground">7 of 12 data points completed</p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Required Data Points</CardTitle>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Users className="w-3 h-3 mr-1.5" />
                Request from Team
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Total land area owned or controlled</h4>
                    <p className="text-sm text-muted-foreground">Specify in hectares</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div className="grid gap-2">
                  <Input value="1,250" readOnly className="bg-muted" />
                  <p className="text-xs text-muted-foreground">✓ Auto-populated from SAP ERP</p>
                </div>
              </div>

              <div className="p-4 border-2 border-primary rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Protected areas within operational boundaries</h4>
                    <p className="text-sm text-muted-foreground">List all protected habitats</p>
                  </div>
                  <Badge variant="outline" className="text-warning">Required</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Protected Area Description</Label>
                  <Textarea placeholder="Describe protected areas, conservation measures, and biodiversity value..." />
                  <Button size="sm" className="mt-2">Save Entry</Button>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Species on IUCN Red List affected by operations</h4>
                    <p className="text-sm text-muted-foreground">Number of threatened species</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div className="grid gap-2">
                  <Input value="0" readOnly className="bg-muted" />
                  <p className="text-xs text-muted-foreground">✓ Verified via environmental assessment</p>
                </div>
              </div>

              <div className="p-4 border-2 border-primary rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Biodiversity restoration initiatives</h4>
                    <p className="text-sm text-muted-foreground">Describe active restoration projects</p>
                  </div>
                  <Badge variant="outline" className="text-warning">Required</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Initiative Description</Label>
                  <Textarea placeholder="Detail any habitat restoration, reforestation, or conservation programs..." />
                  <Button size="sm" className="mt-2">Save Entry</Button>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Freshwater consumption by source</h4>
                    <p className="text-sm text-muted-foreground">In megaliters per year</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div className="grid gap-2">
                  <Input value="3,450" readOnly className="bg-muted" />
                  <p className="text-xs text-muted-foreground">✓ Auto-populated from Oracle</p>
                </div>
              </div>

              <div className="p-4 border-2 border-primary rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Water discharge impact assessment</h4>
                    <p className="text-sm text-muted-foreground">Describe water quality monitoring</p>
                  </div>
                  <Badge variant="outline" className="text-warning">Required</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Assessment Details</Label>
                  <Textarea placeholder="Provide details on water discharge monitoring, quality metrics, and ecological impact..." />
                  <div className="grid gap-2 mt-2">
                    <Label>Supporting Documents</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload monitoring reports (PDF, max 10MB)</p>
                    </div>
                  </div>
                  <Button size="sm" className="mt-2">Save Entry</Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1">Save Progress</Button>
              <Button className="flex-1" variant="outline">Save as Draft</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-muted/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold mb-1.5">Auto-fill Available</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Some data points can be automatically filled from your existing modules.
                  Click below to import verified data from Carbon Engine and Circular Marketplace.
                </p>
                <Button size="sm" variant="outline" className="h-8 text-xs">Import from Modules</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DataCollection;
