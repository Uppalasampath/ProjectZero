import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  Package,
  Building,
  DollarSign,
  Leaf,
  Share2,
  Flag,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [material, setMaterial] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  
  const [offerQuantity, setOfferQuantity] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMaterial();
    }
  }, [id]);

  const fetchMaterial = async () => {
    try {
      const { data: materialData, error: materialError } = await supabase
        .from("waste_materials")
        .select("*")
        .eq("id", id)
        .single();

      if (materialError) throw materialError;

      const { data: sellerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", materialData.user_id)
        .single();

      setMaterial(materialData);
      setSeller(sellerData);
    } catch (error: any) {
      toast({
        title: "Error loading material",
        description: error.message,
        variant: "destructive",
      });
      navigate("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!user) {
      toast({ title: "Please log in to make an offer" });
      navigate("/login");
      return;
    }

    if (!offerQuantity || !offerPrice) {
      toast({
        title: "Missing information",
        description: "Please enter quantity and price",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(offerQuantity) > material.quantity) {
      toast({
        title: "Invalid quantity",
        description: "Quantity exceeds available amount",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const totalAmount = parseFloat(offerQuantity) * parseFloat(offerPrice);

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          buyer_id: user.id,
          seller_id: material.user_id,
          material_id: material.id,
          quantity: parseFloat(offerQuantity),
          unit_price: parseFloat(offerPrice),
          total_amount: totalAmount,
          platform_fee: totalAmount * 0.12, // 12% platform fee
          status: "pending",
          escrow_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for seller
      await supabase.from("notifications").insert({
        user_id: material.user_id,
        notification_type: "transaction",
        title: "New Offer Received",
        message: `${seller?.company_name || "A buyer"} made an offer on your ${material.material_type}`,
        action_url: `/transactions/${data.id}`,
      });

      toast({
        title: "Offer submitted!",
        description: "The seller has been notified of your offer",
      });

      setShowOfferDialog(false);
      navigate("/my-transactions");
    } catch (error: any) {
      toast({
        title: "Error submitting offer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateCarbonImpact = () => {
    // Simplified calculation based on material type
    const factors: Record<string, number> = {
      plastics: 2.5,
      metals: 1.8,
      paper: 1.2,
      organics: 0.9,
      textiles: 2.0,
      chemicals: 3.0,
      electronics: 2.8,
      construction: 1.5,
    };

    const factor = factors[material?.material_type] || 1.5;
    const carbonSaved = (material?.quantity || 0) * factor;
    return carbonSaved.toFixed(1);
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading material details...</div>
      </Layout>
    );
  }

  if (!material) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Button variant="ghost" onClick={() => navigate("/marketplace")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div>
            {material.image_urls && material.image_urls.length > 0 ? (
              <div className="space-y-4">
                <img
                  src={material.image_urls[0]}
                  alt={material.material_type}
                  className="w-full h-96 object-cover rounded-lg"
                />
                {material.image_urls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {material.image_urls.slice(1, 5).map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${material.material_type} ${index + 2}`}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <Package className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Material Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{material.material_type}</Badge>
              <h1 className="text-3xl font-bold capitalize mb-2">
                {material.material_subtype || material.material_type}
              </h1>
              <p className="text-muted-foreground">
                Listed {new Date(material.created_at).toLocaleDateString()}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity Available:</span>
                  <span className="font-semibold">
                    {material.quantity} {material.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality Grade:</span>
                  <Badge className={getQualityColor(material.quality_grade)}>
                    {material.quality_grade}
                  </Badge>
                </div>
                {material.purity_percentage && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purity:</span>
                    <span className="font-semibold">{material.purity_percentage}%</span>
                  </div>
                )}
                {material.description && (
                  <div>
                    <p className="text-muted-foreground mb-1">Description:</p>
                    <p className="text-sm">{material.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-primary">
                  {material.price_per_unit
                    ? `$${material.price_per_unit}/${material.unit}`
                    : "Contact for pricing"}
                </div>
                {material.price_per_unit && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="font-semibold">
                        ${(material.price_per_unit * material.quantity).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee (12%):</span>
                      <span className="font-semibold">
                        ${(material.price_per_unit * material.quantity * 0.12).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {material.user_id !== user?.id && (
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-primary"
                  onClick={() => setShowOfferDialog(true)}
                >
                  Make Offer
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Location */}
          {material.location_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{material.location_address}</p>
                <div className="mt-4 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Map placeholder</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-lg">
                  {seller?.company_name || "Anonymous Seller"}
                </p>
                {seller?.industry && (
                  <p className="text-sm text-muted-foreground capitalize">{seller.industry}</p>
                )}
              </div>
              {seller?.headquarters_location && (
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                  {seller.headquarters_location}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Carbon Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-green-500" />
              Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-2">
              This material could save approximately{" "}
              <span className="font-bold text-green-500">{calculateCarbonImpact()} tons CO2e</span>{" "}
              from landfill emissions
            </p>
            <p className="text-sm text-muted-foreground">
              Based on material type and quantity. Diverted waste reduces landfill methane emissions
              and conserves resources through circular economy practices.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Make Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              Submit your offer for this material. The seller will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Quantity ({material.unit})</Label>
              <Input
                type="number"
                placeholder={`Max: ${material.quantity}`}
                value={offerQuantity}
                onChange={(e) => setOfferQuantity(e.target.value)}
                max={material.quantity}
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="grid gap-2">
              <Label>Price per {material.unit} ($)</Label>
              <Input
                type="number"
                placeholder={material.price_per_unit || "Enter your offer"}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {offerQuantity && offerPrice && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    ${(parseFloat(offerQuantity) * parseFloat(offerPrice)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform Fee (12%):</span>
                  <span>
                    ${(parseFloat(offerQuantity) * parseFloat(offerPrice) * 0.12).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>
                    ${(parseFloat(offerQuantity) * parseFloat(offerPrice) * 1.12).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Message to Seller (Optional)</Label>
              <Textarea
                placeholder="Add any additional details about your offer..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowOfferDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleMakeOffer} disabled={submitting} className="flex-1">
                {submitting ? "Submitting..." : "Submit Offer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}