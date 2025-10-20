import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Sparkles, X, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const qualityGrades = ["A+", "A", "B", "C", "D", "F"];

const ListWaste = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [materialType, setMaterialType] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("tons");
  const [qualityGrade, setQualityGrade] = useState(95);
  const [purity, setPurity] = useState("95");
  const [location, setLocation] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const getQualityGradeFromSlider = (value: number) => {
    if (value >= 95) return "A+";
    if (value >= 85) return "A";
    if (value >= 70) return "B";
    if (value >= 55) return "C";
    if (value >= 40) return "D";
    return "F";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (images.length === 0) return [];

    const imageUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from("material-images")
        .upload(fileName, image);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("material-images")
        .getPublicUrl(fileName);

      imageUrls.push(publicUrl);
    }

    return imageUrls;
  };

  const handleSubmit = async (draft = false) => {
    if (!user) {
      toast({ title: "Please log in to list materials" });
      return;
    }

    if (!materialType || !quantity || !location) {
      toast({
        title: "Missing required fields",
        description: "Please fill in material type, quantity, and location",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const imageUrls = await uploadImages();

      const { data, error } = await supabase
        .from("waste_materials")
        .insert({
          user_id: user.id,
          material_type: materialType,
          material_subtype: materialName || null,
          quantity: parseFloat(quantity),
          unit,
          quality_grade: getQualityGradeFromSlider(qualityGrade),
          purity_percentage: purity ? parseFloat(purity) : null,
          location_address: location,
          price_per_unit: pricePerUnit ? parseFloat(pricePerUnit) : null,
          description: description || null,
          image_urls: imageUrls,
          status: draft ? "draft" : "available",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: draft ? "Draft saved!" : "Material listed successfully!",
        description: draft
          ? "You can complete it later"
          : "Your material is now available in the marketplace",
      });

      if (!draft) {
        navigate(`/marketplace/${data.id}`);
      } else {
        navigate("/my-materials");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

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
              <Label>Material Type *</Label>
              <Select value={materialType} onValueChange={setMaterialType}>
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
              <Label>Material Name (Optional)</Label>
              <Input
                placeholder="e.g., Industrial Steel Scrap"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  placeholder="150"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.1"
                  step="0.1"
                />
              </div>
              <div className="grid gap-2">
                <Label>Unit *</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
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
              <Label>Purity Percentage (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  placeholder="95"
                  className="w-24"
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  min="0"
                  max="100"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>
                Quality Grade: <span className="text-primary font-semibold">{getQualityGradeFromSlider(qualityGrade)}</span>
              </Label>
              <Slider
                value={[qualityGrade]}
                onValueChange={([value]) => setQualityGrade(value)}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {qualityGrades.map(grade => <span key={grade}>{grade}</span>)}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Location *</Label>
              <Input
                placeholder="Enter facility address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Price Expectation (per {unit}) - Optional</Label>
              <Input
                type="number"
                placeholder="450"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid gap-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Provide additional details about the material, its condition, available pickup times, etc."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
            </div>

            <div className="grid gap-2">
              <Label>Upload Photos (Max 5, 5MB each)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={images.length >= 5}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Drag and drop images here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-gradient-primary"
                onClick={() => handleSubmit(false)}
                disabled={uploading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "List Material"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSubmit(true)}
                disabled={uploading}
              >
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ListWaste;
