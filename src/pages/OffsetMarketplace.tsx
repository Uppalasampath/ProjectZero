import { Layout } from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Award, Satellite } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const OffsetMarketplace = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch carbon offset projects from database
  const { data: projects, isLoading } = useQuery({
    queryKey: ['carbon-offset-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carbon_offset_projects')
        .select('*')
        .gt('available_credits', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Filter projects by search term
  const filteredProjects = projects?.filter(project =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.project_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location_country?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading carbon offset projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No carbon offset projects found. {searchTerm && "Try a different search term."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => navigate(`/offset-project/${project.id}`)}>
                <CardHeader>
                  {project.image_url ? (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                      <img src={project.image_url} alt={project.project_name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                      <p className="text-muted-foreground">Project Image</p>
                    </div>
                  )}
                  <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline">{project.project_type}</Badge>
                    {project.satellite_verified && (
                      <Badge className="bg-success gap-1">
                        <Satellite className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{project.project_name}</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {project.location_region && `${project.location_region}, `}
                    {project.location_country || 'Location not specified'}
                  </span>
                </div>
                {project.certification_type && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{project.certification_type}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Price per ton CO2e</p>
                    <p className="text-2xl font-bold text-success">${project.price_per_ton}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="text-sm font-semibold">{project.available_credits.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        )}

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
