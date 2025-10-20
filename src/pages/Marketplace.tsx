import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Grid3x3, List, Heart, MapPin, Package, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 20;

const materialTypes = [
  { value: "metals", label: "Metals" },
  { value: "plastics", label: "Plastics" },
  { value: "organics", label: "Organics" },
  { value: "chemicals", label: "Chemicals" },
  { value: "textiles", label: "Textiles" },
  { value: "paper", label: "Paper" },
  { value: "electronics", label: "Electronics" },
  { value: "construction", label: "Construction Materials" },
];

const qualityGrades = ["A+", "A", "B", "C", "D", "F"];

export default function Marketplace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [materials, setMaterials] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("types")?.split(",").filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [qualityFilters, setQualityFilters] = useState<string[]>([]);
  const [radiusMiles, setRadiusMiles] = useState([100]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMaterials();
    if (user) fetchFavorites();
  }, [searchQuery, selectedTypes, sortBy, currentPage, user]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("waste_materials")
        .select(`
          *,
          profiles!waste_materials_user_id_fkey(company_name)
        `)
        .eq("status", "available");

      if (user) {
        query = query.neq("user_id", user.id);
      }

      if (selectedTypes.length > 0) {
        query = query.in("material_type", selectedTypes);
      }

      if (searchQuery) {
        query = query.or(`material_type.ilike.%${searchQuery}%,material_subtype.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      switch (sortBy) {
        case "price_low":
          query = query.order("price_per_unit", { ascending: true, nullsFirst: false });
          break;
        case "price_high":
          query = query.order("price_per_unit", { ascending: false, nullsFirst: false });
          break;
        case "quality":
          query = query.order("quality_grade", { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      setMaterials(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading materials",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("material_favorites")
        .select("material_id")
        .eq("user_id", user.id);
      
      if (data) {
        setFavorites(new Set(data.map(f => f.material_id)));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (materialId: string) => {
    if (!user) {
      toast({ title: "Please log in to save favorites" });
      return;
    }

    try {
      if (favorites.has(materialId)) {
        await supabase
          .from("material_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("material_id", materialId);
        
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(materialId);
          return newSet;
        });
      } else {
        await supabase
          .from("material_favorites")
          .insert({ user_id: user.id, material_id: materialId });
        
        setFavorites(prev => new Set(prev).add(materialId));
      }
    } catch (error: any) {
      toast({
        title: "Error updating favorites",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setPriceRange([0, 1000]);
    setQualityFilters([]);
    setRadiusMiles([100]);
    setSearchParams({});
  };

  const getQualityColor = (grade: string) => {
    const colors: Record<string, string> = {
      "A+": "bg-green-500",
      "A": "bg-green-400",
      "B": "bg-blue-400",
      "C": "bg-yellow-400",
      "D": "bg-orange-400",
      "F": "bg-red-400",
    };
    return colors[grade] || "bg-gray-400";
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      if (material.price_per_unit && (material.price_per_unit < priceRange[0] || material.price_per_unit > priceRange[1])) {
        return false;
      }

      if (qualityFilters.length > 0 && !qualityFilters.includes(material.quality_grade)) {
        return false;
      }

      return true;
    });
  }, [materials, priceRange, qualityFilters]);

  return (
    <Layout>
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-80 space-y-6 hidden lg:block">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Material Type */}
              <div className="space-y-3">
                <Label className="font-semibold">Material Type</Label>
                {materialTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={() => handleTypeToggle(type.value)}
                    />
                    <label htmlFor={type.value} className="text-sm cursor-pointer flex-1">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="font-semibold">Price per Unit ($)</Label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Quality Grade */}
              <div className="space-y-3">
                <Label className="font-semibold">Quality Grade</Label>
                {qualityGrades.map(grade => (
                  <div key={grade} className="flex items-center space-x-2">
                    <Checkbox
                      id={`quality-${grade}`}
                      checked={qualityFilters.includes(grade)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQualityFilters(prev => [...prev, grade]);
                        } else {
                          setQualityFilters(prev => prev.filter(g => g !== grade));
                        }
                      }}
                    />
                    <label htmlFor={`quality-${grade}`} className="text-sm cursor-pointer">
                      {grade}
                    </label>
                  </div>
                ))}
              </div>

              {/* Distance */}
              <div className="space-y-3">
                <Label className="font-semibold">Distance (miles)</Label>
                <div className="px-2">
                  <Slider
                    value={radiusMiles}
                    onValueChange={setRadiusMiles}
                    max={500}
                    step={25}
                    className="mb-2"
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    Within {radiusMiles[0]} miles
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={fetchMaterials}>
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">
                {filteredMaterials.length} materials available
              </p>
            </div>
            <Button onClick={() => navigate("/list-waste")}>
              List Your Waste
            </Button>
          </div>

          {/* Search and Sort Bar */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="quality">Quality: Highest</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Materials Grid/List */}
          {loading ? (
            <div className="text-center py-12">Loading materials...</div>
          ) : filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No materials found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/marketplace/${material.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      {material.image_urls && material.image_urls[0] ? (
                        <img
                          src={material.image_urls[0]}
                          alt={material.material_type}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(material.id);
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.has(material.id) ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      </Button>
                    </div>

                    <Badge className="mb-2">{material.material_type}</Badge>
                    
                    <h3 className="font-semibold mb-2 capitalize">
                      {material.material_subtype || material.material_type}
                    </h3>

                    <div className="space-y-1 text-sm mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">
                          {material.quantity} {material.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Quality:</span>
                        <Badge className={getQualityColor(material.quality_grade)}>
                          {material.quality_grade}
                        </Badge>
                      </div>
                      {material.purity_percentage && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Purity:</span>
                          <span className="font-medium">{material.purity_percentage}%</span>
                        </div>
                      )}
                    </div>

                    {material.location_address && (
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        {material.location_address}
                      </div>
                    )}

                    <div className="text-xl font-bold text-primary">
                      {material.price_per_unit
                        ? `$${material.price_per_unit}/${material.unit}`
                        : "Price on request"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredMaterials.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink>{currentPage}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </Layout>
  );
}