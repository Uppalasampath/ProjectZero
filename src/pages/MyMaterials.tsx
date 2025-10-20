import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Eye, Edit, Trash2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function MyMaterials() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMaterials();
    }
  }, [user]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("waste_materials")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      const { error } = await supabase
        .from("waste_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Material deleted successfully" });
      fetchMaterials();
    } catch (error: any) {
      toast({
        title: "Error deleting material",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      const { error } = await supabase
        .from("waste_materials")
        .update({ status: "sold" })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Material marked as sold" });
      fetchMaterials();
    } catch (error: any) {
      toast({
        title: "Error updating material",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      available: { variant: "default", label: "Active" },
      draft: { variant: "secondary", label: "Draft" },
      sold: { variant: "outline", label: "Sold Out" },
    };

    const config = variants[status] || variants.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading your materials...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Materials</h1>
            <p className="text-muted-foreground mt-1">
              Manage your listed waste materials
            </p>
          </div>
          <Button onClick={() => navigate("/list-waste")}>
            <Plus className="w-4 h-4 mr-2" />
            List New Material
          </Button>
        </div>

        {materials.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No materials listed yet</h3>
              <p className="text-muted-foreground mb-4">
                Start listing your waste materials to connect with buyers
              </p>
              <Button onClick={() => navigate("/list-waste")}>
                <Plus className="w-4 h-4 mr-2" />
                List Your First Material
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium capitalize">
                      {material.material_subtype || material.material_type}
                    </TableCell>
                    <TableCell>
                      {material.quantity} {material.unit}
                    </TableCell>
                    <TableCell>
                      {material.price_per_unit
                        ? `$${material.price_per_unit}/${material.unit}`
                        : "On request"}
                    </TableCell>
                    <TableCell>
                      <Badge>{material.quality_grade}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(material.status)}</TableCell>
                    <TableCell>
                      {new Date(material.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/marketplace/${material.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/list-waste?edit=${material.id}`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {material.status === "available" && (
                            <DropdownMenuItem
                              onClick={() => handleMarkSold(material.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Sold
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(material.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </Layout>
  );
}