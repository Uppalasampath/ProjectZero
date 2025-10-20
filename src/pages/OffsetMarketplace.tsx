import { Layout } from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Award, Satellite } from "lucide-react";
import { useNavigate } from "react-router-dom";

const projects = [
  {
    id: 1,
    name: "Amazon Rainforest Conservation",
    type: "Reforestation",
    location: "Brazil",
    pricePerTon: 12,
    verified: true,
    certification: "Gold Standard",
    available: "50,000 tons"
  },
  {
    id: 2,
    name: "Wind Farm Development",
    type: "Renewable Energy",
    location: "Texas, USA",
    pricePerTon: 15,
    verified: true,
    certification: "Verra VCS",
    available: "100,000 tons"
  },
  {
    id: 3,
    name: "Mangrove Restoration",
    type: "Blue Carbon",
    location: "Indonesia",
    pricePerTon: 18,
    verified: true,
    certification: "Gold Standard",
    available: "25,000 tons"
  },
  {
    id: 4,
    name: "Solar Energy in Rural Communities",
    type: "Renewable Energy",
    location: "India",
    pricePerTon: 10,
    verified: true,
    certification: "CDM",
    available: "75,000 tons"
  },
  {
    id: 5,
    name: "Forest Protection Program",
    type: "REDD+",
    location: "Peru",
    pricePerTon: 14,
    verified: true,
    certification: "Verra VCS",
    available: "40,000 tons"
  },
  {
    id: 6,
    name: "Biogas from Agricultural Waste",
    type: "Waste Management",
    location: "Kenya",
    pricePerTon: 11,
    verified: true,
    certification: "Gold Standard",
    available: "15,000 tons"
  },
];

const OffsetMarketplace = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Carbon Offset Marketplace</h1>
            <p className="text-muted-foreground mt-1">Purchase verified carbon credits from global projects</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-10" />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate(`/offset-project/${project.id}`)}>
              <CardHeader>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                  <p className="text-muted-foreground">Project Image</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline">{project.type}</Badge>
                    {project.verified && (
                      <Badge className="bg-success gap-1">
                        <Satellite className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{project.certification}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Price per ton CO2e</p>
                    <p className="text-2xl font-bold text-success">${project.pricePerTon}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="text-sm font-semibold">{project.available}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold">My Carbon Credits</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground mb-2">Total Credits Purchased</p>
                <p className="text-3xl font-bold">15,000 tons</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Available to Retire</p>
                <p className="text-3xl font-bold">12,500 tons</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Total Investment</p>
                <p className="text-3xl font-bold text-success">$187,500</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OffsetMarketplace;
