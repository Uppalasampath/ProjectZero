import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, MapPin, Package } from "lucide-react";

const materials = [
  { 
    id: 1, 
    name: "Industrial Steel Scrap", 
    type: "Metals", 
    quantity: "150", 
    unit: "tons",
    purity: "95%", 
    distance: "12 km", 
    price: "$450",
    quality: "A+",
    location: "Detroit, MI"
  },
  { 
    id: 2, 
    name: "HDPE Plastic Pellets", 
    type: "Plastics", 
    quantity: "80", 
    unit: "tons",
    purity: "98%", 
    distance: "8 km", 
    price: "$320",
    quality: "A",
    location: "Cleveland, OH"
  },
  { 
    id: 3, 
    name: "Organic Waste Compost", 
    type: "Organics", 
    quantity: "200", 
    unit: "tons",
    purity: "92%", 
    distance: "25 km", 
    price: "$180",
    quality: "B+",
    location: "Chicago, IL"
  },
  { 
    id: 4, 
    name: "Mixed Paper Stock", 
    type: "Paper", 
    quantity: "120", 
    unit: "tons",
    purity: "88%", 
    distance: "15 km", 
    price: "$220",
    quality: "B",
    location: "Indianapolis, IN"
  },
  { 
    id: 5, 
    name: "Chemical Solvents", 
    type: "Chemicals", 
    quantity: "45", 
    unit: "tons",
    purity: "99%", 
    distance: "30 km", 
    price: "$680",
    quality: "A+",
    location: "Pittsburgh, PA"
  },
  { 
    id: 6, 
    name: "Textile Fiber Waste", 
    type: "Textiles", 
    quantity: "90", 
    unit: "tons",
    purity: "85%", 
    distance: "18 km", 
    price: "$280",
    quality: "B+",
    location: "Columbus, OH"
  },
];

const Marketplace = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Circular Marketplace</h1>
            <p className="text-muted-foreground mt-1">Buy and sell waste materials efficiently</p>
          </div>
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            List Your Waste
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">{material.type}</Badge>
                    <h3 className="font-semibold text-lg">{material.name}</h3>
                  </div>
                  <Badge className="bg-success">{material.quality}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-semibold">{material.quantity} {material.unit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Purity</span>
                  <span className="font-semibold">{material.purity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{material.location} • {material.distance}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price per ton</span>
                    <span className="text-xl font-bold text-success">{material.price}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Stats Banner */}
        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <Package className="w-8 h-8 mx-auto mb-2" />
                <p className="text-3xl font-bold">28</p>
                <p className="text-sm opacity-90">Active Listings</p>
              </div>
              <div>
                <Package className="w-8 h-8 mx-auto mb-2" />
                <p className="text-3xl font-bold">12</p>
                <p className="text-sm opacity-90">Pending Transactions</p>
              </div>
              <div>
                <Package className="w-8 h-8 mx-auto mb-2" />
                <p className="text-3xl font-bold">$45.2K</p>
                <p className="text-sm opacity-90">Revenue This Month</p>
              </div>
              <div>
                <Package className="w-8 h-8 mx-auto mb-2" />
                <p className="text-3xl font-bold">156</p>
                <p className="text-sm opacity-90">Tons Diverted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Marketplace;
