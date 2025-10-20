import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Award, Satellite, Shield, TrendingUp, Users } from "lucide-react";
import { useParams } from "react-router-dom";

const OffsetProjectDetail = () => {
  const { id } = useParams();

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Amazon Rainforest Conservation</h1>
            <p className="text-muted-foreground mt-1">Project ID: {id}</p>
          </div>
          <Badge className="bg-success gap-1">
            <Satellite className="w-3 h-3" />
            Satellite Verified
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Project Hero Image</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About This Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  This REDD+ project protects 500,000 hectares of primary rainforest in the Brazilian Amazon. 
                  By preventing deforestation and supporting local communities, the project avoids an estimated 
                  2 million tons of CO2e emissions annually while preserving biodiversity and indigenous lands.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Project Type</p>
                    <p className="font-semibold">Reforestation & REDD+</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Pará State, Brazil
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-semibold">January 2020</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">30 years</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <p className="text-sm text-muted-foreground">CO2 Avoided</p>
                    </div>
                    <p className="text-2xl font-bold">2M tons/year</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-primary" />
                      <p className="text-sm text-muted-foreground">Communities</p>
                    </div>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Forest Area</p>
                    <p className="text-2xl font-bold">500K ha</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Jobs Created</p>
                    <p className="text-2xl font-bold">850</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satellite Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Before (2019)</p>
                  </div>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">After (2024)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <Satellite className="w-5 h-5" />
                  <p className="font-semibold">Verified via satellite imagery • Last updated: Jan 2025</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Independent verification using NASA MODIS and ESA Sentinel-2 satellite data confirms 
                  zero deforestation within project boundaries.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications & Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {["Gold Standard", "Verra VCS", "CCBS"].map((cert) => (
                    <div key={cert} className="p-4 border border-border rounded-lg text-center">
                      <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-semibold">{cert}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Carbon Credits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-success">$12<span className="text-base font-normal text-muted-foreground">/ton CO2e</span></p>
                  <p className="text-sm text-muted-foreground mt-1">50,000 tons available</p>
                </div>
                <div className="space-y-2">
                  <Label>Quantity (tons CO2e)</Label>
                  <Input type="number" placeholder="100" defaultValue="100" />
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">$1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform Fee</span>
                    <span className="font-semibold">$36</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-success">$1,236</span>
                </div>
                <Button className="w-full bg-gradient-primary">Purchase Credits</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-semibold">Offsetting 100 tons CO2e is equivalent to:</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trees planted</span>
                    <span className="font-semibold">4,545 trees</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cars removed</span>
                    <span className="font-semibold">22 cars/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flights (NYC-LA)</span>
                    <span className="font-semibold">50 flights</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-primary text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Blockchain Verified
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm opacity-90">
                  All credits are registered on the blockchain for full transparency and traceability.
                </p>
                <p className="text-xs opacity-75 font-mono break-all">
                  Registry: 0x742d35Cc6634C0532925a3b844Bc9e
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Wind Farm - Texas", "Mangrove Restoration", "Solar Energy - India"].map((project) => (
                  <div key={project} className="p-3 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <p className="font-semibold text-sm">{project}</p>
                    <p className="text-xs text-muted-foreground">From $10/ton</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OffsetProjectDetail;
