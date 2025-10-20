import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Send, Users, CheckCircle, Clock, AlertCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SupplierPortal() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [deadline, setDeadline] = useState("60");

  useEffect(() => {
    if (user) {
      fetchSuppliers();
    }
  }, [user]);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("supplier_assessments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading suppliers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitations = async () => {
    if (selectedSuppliers.length === 0) {
      toast({
        title: "No suppliers selected",
        description: "Please select at least one supplier",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update selected suppliers status to 'sent'
      const { error } = await supabase
        .from("supplier_assessments")
        .update({ assessment_status: "sent" })
        .in("id", selectedSuppliers);

      if (error) throw error;

      toast({
        title: "Invitations sent!",
        description: `${selectedSuppliers.length} suppliers have been invited to complete their assessment`,
      });

      setShowInviteDialog(false);
      setSelectedSuppliers([]);
      fetchSuppliers();
    } catch (error: any) {
      toast({
        title: "Error sending invitations",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; icon: any; label: string }> = {
      not_sent: { variant: "outline", icon: Clock, label: "Not Sent" },
      sent: { variant: "secondary", icon: Send, label: "Sent" },
      completed: { variant: "default", icon: CheckCircle, label: "Completed" },
    };

    const { variant, icon: Icon, label } = config[status] || config.not_sent;

    return (
      <Badge variant={variant}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const completionRate = () => {
    if (suppliers.length === 0) return 0;
    const completed = suppliers.filter(s => s.assessment_status === "completed").length;
    return (completed / suppliers.length) * 100;
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading supplier data...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Supplier Engagement Portal</h1>
            <p className="text-muted-foreground mt-1">
              Collect emissions data from your supply chain
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Suppliers
            </Button>
            <Button
              onClick={() => setShowInviteDialog(true)}
              disabled={suppliers.filter(s => s.assessment_status === "not_sent").length === 0}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invitations
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Supplier Engagement Progress
              </CardTitle>
              <Badge className="text-lg px-4 py-2">
                {suppliers.filter(s => s.assessment_status === "completed").length} of{" "}
                {suppliers.length} completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completionRate()} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{suppliers.length}</p>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">
                  {suppliers.filter(s => s.assessment_status === "sent").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {suppliers.filter(s => s.assessment_status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        {suppliers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No suppliers added yet</h3>
              <p className="text-muted-foreground mb-4">
                Import your supplier list to start collecting emissions data
              </p>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Import Suppliers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ESG Score</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                    <TableCell>{supplier.supplier_email || "No email"}</TableCell>
                    <TableCell>{getStatusBadge(supplier.assessment_status)}</TableCell>
                    <TableCell>
                      {supplier.esg_score ? (
                        <Badge variant="outline">{supplier.esg_score}/100</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {supplier.response_date
                        ? new Date(supplier.response_date).toLocaleDateString()
                        : new Date(supplier.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Supplier Assessments</DialogTitle>
              <DialogDescription>
                Select suppliers and customize your invitation message
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Select Suppliers</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {suppliers
                    .filter(s => s.assessment_status === "not_sent")
                    .map((supplier) => (
                      <label key={supplier.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSuppliers.includes(supplier.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSuppliers([...selectedSuppliers, supplier.id]);
                            } else {
                              setSelectedSuppliers(
                                selectedSuppliers.filter(id => id !== supplier.id)
                              );
                            }
                          }}
                        />
                        <span className="text-sm">{supplier.supplier_name}</span>
                      </label>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedSuppliers.length} supplier(s) selected
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Assessment Deadline</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Custom Message (Optional)</Label>
                <Textarea
                  placeholder="Dear Supplier,&#10;&#10;We are conducting a sustainability assessment..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvitations}
                  disabled={selectedSuppliers.length === 0}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitations ({selectedSuppliers.length})
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}