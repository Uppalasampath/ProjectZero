import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { CheckCircle2, AlertCircle, FileText, Upload, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerifyTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [checklist, setChecklist] = useState({
    materialDelivered: false,
    weighBridgeTicket: false,
    qualityInspection: false,
    wasteDiversionProof: false,
    recyclingCertificate: false,
    photographicEvidence: false,
  });

  // Fetch transaction details
  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction-verify', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          material:waste_materials(material_type, quantity, unit)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const completedSteps = Object.values(checklist).filter(Boolean).length;
  const totalSteps = Object.values(checklist).length;
  const progressPercent = (completedSteps / totalSteps) * 100;

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitForVerification = () => {
    if (completedSteps === totalSteps) {
      toast({
        title: "Verification submitted!",
        description: "Your documentation has been submitted for third-party verification. You'll be notified when complete.",
      });
      navigate('/my-transactions');
    } else {
      toast({
        title: "Incomplete checklist",
        description: "Please complete all verification steps before submitting.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading verification checklist...</p>
        </div>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Transaction not found</p>
          <Button onClick={() => navigate('/my-transactions')}>Back to Transactions</Button>
        </div>
      </Layout>
    );
  }

  const material = transaction.material as any;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/transactions/${id}`)}>
            ← Back to Transaction
          </Button>
          <h1 className="text-3xl font-bold mt-4">Carbon Credit Verification</h1>
          <p className="text-muted-foreground mt-1">
            Complete the verification checklist to claim official carbon credits
          </p>
        </div>

        {/* Overview Card */}
        <Card className="bg-gradient-eco text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Estimated Carbon Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-4xl font-bold">
                ~{transaction.carbon_credits_generated?.toFixed(1) || 0} tons CO2e
              </p>
              <p className="text-sm opacity-90">Estimated carbon credits from waste diversion</p>
            </div>
            <div className="bg-white/10 rounded p-3">
              <p className="text-sm"><strong>Material:</strong> {material?.material_type}</p>
              <p className="text-sm"><strong>Quantity:</strong> {transaction.quantity} {material?.unit}</p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Progress</CardTitle>
            <CardDescription>
              {completedSteps} of {totalSteps} steps completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {progressPercent === 100
                ? "Ready to submit for verification!"
                : `${totalSteps - completedSteps} steps remaining`}
            </p>
          </CardContent>
        </Card>

        {/* Verification Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Checklist</CardTitle>
            <CardDescription>
              Collect and upload the following documentation to verify carbon credits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                id="materialDelivered"
                checked={checklist.materialDelivered}
                onCheckedChange={() => handleChecklistChange('materialDelivered')}
              />
              <div className="flex-1">
                <label htmlFor="materialDelivered" className="font-medium cursor-pointer">
                  Material Delivery Confirmation
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Proof that material was delivered to recycling/recovery facility
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Delivery Receipt
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                id="weighBridgeTicket"
                checked={checklist.weighBridgeTicket}
                onCheckedChange={() => handleChecklistChange('weighBridgeTicket')}
              />
              <div className="flex-1">
                <label htmlFor="weighBridgeTicket" className="font-medium cursor-pointer">
                  Weigh Bridge Ticket
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Official weighing documentation showing exact quantity
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Weigh Ticket
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                id="qualityInspection"
                checked={checklist.qualityInspection}
                onCheckedChange={() => handleChecklistChange('qualityInspection')}
              />
              <div className="flex-1">
                <label htmlFor="qualityInspection" className="font-medium cursor-pointer">
                  Quality Inspection Report
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Third-party verification of material quality and purity
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Inspection Report
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                id="wasteDiversionProof"
                checked={checklist.wasteDiversionProof}
                onCheckedChange={() => handleChecklistChange('wasteDiversionProof')}
              />
              <div className="flex-1">
                <label htmlFor="wasteDiversionProof" className="font-medium cursor-pointer">
                  Waste Diversion Proof
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Evidence that material was diverted from landfill
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Diversion Certificate
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                id="recyclingCertificate"
                checked={checklist.recyclingCertificate}
                onCheckedChange={() => handleChecklistChange('recyclingCertificate')}
              />
              <div className="flex-1">
                <label htmlFor="recyclingCertificate" className="font-medium cursor-pointer">
                  Recycling/Recovery Certificate
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Certificate from facility confirming material was properly processed
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Certificate
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                id="photographicEvidence"
                checked={checklist.photographicEvidence}
                onCheckedChange={() => handleChecklistChange('photographicEvidence')}
              />
              <div className="flex-1">
                <label htmlFor="photographicEvidence" className="font-medium cursor-pointer">
                  Photographic Evidence
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Photos showing material condition, processing, and final state
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photos (3-5 images)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                1
              </div>
              <div>
                <p className="font-medium">Submit Documentation</p>
                <p className="text-sm text-muted-foreground">
                  Complete the checklist and upload all required documents
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                2
              </div>
              <div>
                <p className="font-medium">Third-Party Verification</p>
                <p className="text-sm text-muted-foreground">
                  Independent auditor reviews your documentation (typically 5-10 business days)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                3
              </div>
              <div>
                <p className="font-medium">Receive Official Credits</p>
                <p className="text-sm text-muted-foreground">
                  Upon verification, carbon credits are officially registered and can be used for compliance or sold
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmitForVerification}
            className="flex-1"
            disabled={progressPercent !== 100}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Submit for Verification
          </Button>
          <Button variant="outline" onClick={() => navigate(`/transactions/${id}`)}>
            Save Progress
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyTransaction;
