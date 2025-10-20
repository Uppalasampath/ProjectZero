import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck, Shield, Leaf, MessageSquare, CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";

const TransactionDetail = () => {
  const { id } = useParams();

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transaction Details</h1>
            <p className="text-muted-foreground mt-1">Transaction ID: {id}</p>
          </div>
          <Badge className="bg-success">Completed</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Material Photo</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Industrial Steel Scrap</h3>
                  <Badge variant="outline" className="mt-2">Metals</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="text-lg font-semibold">150 tons</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purity</p>
                    <p className="text-lg font-semibold">95%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quality Grade</p>
                    <p className="text-lg font-semibold">A+</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Ton</p>
                    <p className="text-lg font-semibold text-success">$450</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logistics & Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <Truck className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Route: Detroit, MI → Cleveland, OH</p>
                    <p className="text-sm text-muted-foreground">Distance: 170 miles • Est. 3 hours</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Carrier: GreenLogistics Inc. • CO2 emissions: 0.8 tons
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Photo {i}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-semibold">Verified by third-party inspector</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Visual inspection completed on 2024-01-15. Material quality matches specification. 
                  Purity test results: 95.2% (within tolerance).
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Counterparty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">RC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">Regional Recycling Co.</p>
                    <p className="text-sm text-muted-foreground">Cleveland, OH</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-semibold">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transactions</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-semibold">2022</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Buyer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price</span>
                  <span className="font-semibold">$67,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Logistics Fee</span>
                  <span className="font-semibold">-$2,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (3%)</span>
                  <span className="font-semibold">-$2,025</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Net Revenue</span>
                  <span className="font-bold text-success">$62,675</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-primary text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Carbon Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">15 tons</p>
                  <p className="text-sm opacity-90">CO2e avoided vs virgin production</p>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Shield className="w-4 h-4" />
                  <span>Automatically verified & reported to CSRD</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Smart Contract Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Escrow Released</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contract ID: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
                </p>
                <Button className="w-full" variant="outline" size="sm">
                  View on Blockchain
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionDetail;
