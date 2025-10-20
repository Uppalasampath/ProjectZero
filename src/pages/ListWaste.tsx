import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Sparkles } from "lucide-react";

const ListWaste = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">List Your Waste Material</h1>
          <p className="text-muted-foreground mt-1">Connect with buyers and turn waste into revenue</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Material Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label>Material Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select material type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metals">Metals</SelectItem>
                  <SelectItem value="plastics">Plastics</SelectItem>
                  <SelectItem value="organics">Organics</SelectItem>
                  <SelectItem value="chemicals">Chemicals</SelectItem>
                  <SelectItem value="textiles">Textiles</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="construction">Construction Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Material Name</Label>
              <Input placeholder="e.g., Industrial Steel Scrap" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder="150" />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tons">Tons</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="lbs">Pounds</SelectItem>
                    <SelectItem value="cubic-meters">Cubic Meters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Purity Percentage</Label>
              <div className="flex items-center gap-4">
                <Input type="number" placeholder="95" className="w-24" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Quality Grade: <span className="text-primary font-semibold">A+</span></Label>
              <Slider defaultValue={[95]} max={100} step={5} className="mt-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>F</span>
                <span>D</span>
                <span>C</span>
                <span>B</span>
                <span>A</span>
                <span>A+</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Location</Label>
              <Input placeholder="Enter facility address" />
            </div>

            <div className="grid gap-2">
              <Label>Price Expectation (per ton) - Optional</Label>
              <Input type="number" placeholder="450" />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Provide additional details about the material, its condition, available pickup times, etc."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label>Upload Photos</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">Drag and drop images here, or click to browse</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 bg-gradient-primary">
                <Sparkles className="w-4 h-4 mr-2" />
                Find AI Matches
              </Button>
              <Button variant="outline" className="flex-1">Save as Draft</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ListWaste;
