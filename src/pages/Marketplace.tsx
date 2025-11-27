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
      "A+": "bg-green-600 text-white",
      "A": "bg-green-500 text-white",
      "B": "bg-blue-500 text-white",
      "C": "bg-yellow-500 text-white",
      "D": "bg-orange-500 text-white",
      "F": "bg-red-500 text-white",
    };
    return colors[grade] || "bg-neutral-400 text-white";
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
          <Card className="border border-neutral-200 bg-white shadow-none">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50">
                  <X className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Material Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-900">Material Type</Label>
                {materialTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={() => handleTypeToggle(type.value)}
                      className="border-neutral-300"
                    />
                    <label htmlFor={type.value} className="text-sm cursor-pointer flex-1 text-neutral-700">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-900">Price per Unit ($)</Label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Quality Grade */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-900">Quality Grade</Label>
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
                      className="border-neutral-300"
                    />
                    <label htmlFor={`quality-${grade}`} className="text-sm cursor-pointer text-neutral-700">
                      {grade}
                    </label>
                  </div>
                ))}
              </div>

              {/* Distance */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-900">Distance (miles)</Label>
                <div className="px-2">
                  <Slider
                    value={radiusMiles}
                    onValueChange={setRadiusMiles}
                    max={500}
                    step={25}
                    className="mb-2"
                  />
                  <div className="text-sm text-neutral-600 text-center">
                    Within {radiusMiles[0]} miles
                  </div>
                </div>
              </div>

              <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-10" onClick={fetchMaterials}>
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="border-b border-neutral-200 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-light text-neutral-900">Circular Marketplace</h1>
                <p className="text-sm text-neutral-600 mt-1">
                  {filteredMaterials.length} materials available
                </p>
              </div>
              <Button size="sm" onClick={() => navigate("/list-waste")} className="bg-neutral-900 hover:bg-neutral-800 text-white">
                List Material
              </Button>
            </div>
          </div>

          {/* Search and Sort Bar */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-neutral-300 focus:border-neutral-900"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 border-neutral-300">
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
                className={viewMode === "grid" ? "bg-neutral-900 hover:bg-neutral-800" : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-neutral-900 hover:bg-neutral-800" : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Materials Grid/List */}
          {loading ? (
            <div className="text-center py-12 text-neutral-600">Loading materials...</div>
          ) : filteredMaterials.length === 0 ? (
            <Card className="border border-neutral-200 bg-white shadow-none">
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-medium mb-2 text-neutral-900">No materials found</h3>
                <p className="text-neutral-600 mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters} className="border-neutral-300 text-neutral-900 hover:bg-neutral-50">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="border border-neutral-200 bg-white shadow-none hover:border-neutral-300 transition-colors cursor-pointer"
                  onClick={() => navigate(`/marketplace/${material.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      {material.image_urls && material.image_urls[0] ? (
                        <img
                          src={material.image_urls[0]}
                          alt={material.material_type}
                          className="w-full h-40 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-40 bg-neutral-100 rounded flex items-center justify-center">
                          <Package className="w-10 h-10 text-neutral-400" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 h-8 w-8 bg-white hover:bg-neutral-50 border border-neutral-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(material.id);
                        }}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            favorites.has(material.id) ? "fill-red-500 text-red-500" : "text-neutral-600"
                          }`}
                        />
                      </Button>
                    </div>

                    <Badge variant="secondary" className="mb-2 text-xs bg-neutral-100 text-neutral-700 border-0">{material.material_type}</Badge>

                    <h3 className="text-sm font-medium mb-2 capitalize text-neutral-900">
                      {material.material_subtype || material.material_type}
                    </h3>

                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-600">Quantity:</span>
                        <span className="font-medium text-neutral-900">
                          {material.quantity} {material.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-600">Quality:</span>
                        <Badge variant="secondary" className={`${getQualityColor(material.quality_grade)} text-xs border-0`}>
                          {material.quality_grade}
                        </Badge>
                      </div>
                      {material.purity_percentage && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-600">Purity:</span>
                          <span className="font-medium text-neutral-900">{material.purity_percentage}%</span>
                        </div>
                      )}
                    </div>

                    {material.location_address && (
                      <div className="flex items-center text-xs text-neutral-600 mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{material.location_address}</span>
                      </div>
                    )}

                    <div className="text-lg font-light text-neutral-900 border-t border-neutral-200 pt-2 mt-2">
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
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-neutral-50"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink className="bg-neutral-100 text-neutral-900">{currentPage}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="cursor-pointer hover:bg-neutral-50"
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
