import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck, Shield, Leaf, MessageSquare, CheckCircle, AlertCircle, Check, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TransactionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch transaction details
  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          material:waste_materials(*),
          buyer:buyer_id(company_name, headquarters_location, created_at),
          seller:seller_id(company_name, headquarters_location, created_at)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Accept transaction mutation
  const acceptTransaction = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'active',
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Transaction accepted!",
        description: "The buyer has been notified.",
      });
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error accepting transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject transaction mutation
  const rejectTransaction = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Transaction rejected",
        description: "The buyer has been notified.",
      });
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      navigate('/my-transactions');
    },
    onError: (error: any) => {
      toast({
        title: "Error rejecting transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete transaction mutation (with estimated carbon credit calculation)
  const completeTransaction = useMutation({
    mutationFn: async () => {
      if (!transaction) return;

      const material = transaction.material as any;
      const materialType = material?.material_type || '';
      const quantity = transaction.quantity || 0;

      // Call the database function to estimate carbon credits
      const { data: carbonData, error: carbonError } = await supabase.rpc(
        'calculate_carbon_credits',
        {
          material_type: materialType,
          quantity_tons: quantity,
        }
      );

      if (carbonError) throw carbonError;

      const carbonCredits = carbonData?.[0] || { carbon_tons: 0, credit_value: 0 };

      // Update transaction with completed status and estimated carbon credits
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          carbon_credits_generated: carbonCredits.carbon_tons,
          carbon_credits_value: carbonCredits.credit_value,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Transaction completed!",
        description: "Estimated carbon impact has been calculated. Complete verification to claim credits.",
      });
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['carbon-credits'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error completing transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading transaction details...</p>
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
  const buyer = transaction.buyer as any;
  const seller = transaction.seller as any;
  const isSeller = transaction.seller_id === user?.id;
  const counterparty = isSeller ? buyer : seller;
  const counterpartyInitials = counterparty?.company_name?.substring(0, 2).toUpperCase() || 'UK';

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success";
      case "active": return "bg-primary";
      case "pending": return "bg-warning";
      case "rejected": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transaction Details</h1>
            <p className="text-muted-foreground mt-1">Transaction ID: {id?.substring(0, 8)}</p>
          </div>
          <div className="flex gap-3 items-center">
            <Badge className={getStatusColor(transaction.status || 'pending')}>
              {transaction.status || 'pending'}
            </Badge>
            {transaction.status === 'pending' && isSeller && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => acceptTransaction.mutate()}
                  disabled={acceptTransaction.isPending}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => rejectTransaction.mutate()}
                  disabled={rejectTransaction.isPending}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
            {transaction.status === 'active' && isSeller && (
              <Button
                size="sm"
                variant="default"
                onClick={() => completeTransaction.mutate()}
                disabled={completeTransaction.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark as Completed
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {material?.image_urls && Array.isArray(material.image_urls) && material.image_urls.length > 0 ? (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img src={material.image_urls[0]} alt="Material" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold">{material?.material_type || 'Unknown Material'}</h3>
                  {material?.material_subtype && (
                    <Badge variant="outline" className="mt-2">{material.material_subtype}</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="text-lg font-semibold">
                      {transaction.quantity} {material?.unit || 'tons'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purity</p>
                    <p className="text-lg font-semibold">
                      {material?.purity_percentage ? `${material.purity_percentage}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quality Grade</p>
                    <p className="text-lg font-semibold">{material?.quality_grade || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Unit</p>
                    <p className="text-lg font-semibold text-success">
                      ${transaction.unit_price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logistics & Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <Truck className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    {transaction.logistics_provider ? (
                      <>
                        <p className="font-semibold">Carrier: {transaction.logistics_provider}</p>
                        {transaction.tracking_number && (
                          <p className="text-sm text-muted-foreground">
                            Tracking: {transaction.tracking_number}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Logistics details to be confirmed</p>
                    )}
                    {material?.location_address && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Pickup: {material.location_address}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Counterparty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {counterpartyInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {counterparty?.company_name || 'Unknown Company'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {counterparty?.headquarters_location || 'Location not specified'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-semibold">
                      {counterparty?.created_at
                        ? new Date(counterparty.created_at).getFullYear()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact {isSeller ? 'Buyer' : 'Seller'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price</span>
                  <span className="font-semibold">${transaction.total_amount.toLocaleString()}</span>
                </div>
                {transaction.platform_fee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-semibold">-${transaction.platform_fee.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">{isSeller ? 'Net Revenue' : 'Total Cost'}</span>
                  <span className="font-bold text-success">
                    ${(transaction.total_amount - (transaction.platform_fee || 0)).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-primary text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Estimated Carbon Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">
                    {transaction.carbon_credits_generated
                      ? `~${transaction.carbon_credits_generated.toFixed(1)} tons`
                      : 'Pending calculation'}
                  </p>
                  <p className="text-sm opacity-90">Estimated CO2e avoided vs virgin production</p>
                </div>
                {transaction.carbon_credits_value && (
                  <div>
                    <p className="text-lg font-semibold">
                      ~${transaction.carbon_credits_value.toLocaleString()}
                    </p>
                    <p className="text-sm opacity-90">Estimated carbon credit value</p>
                  </div>
                )}
                {transaction.status === 'completed' && transaction.carbon_credits_generated && (
                  <>
                    <div className="flex items-center gap-2 text-sm opacity-90 bg-white/10 rounded p-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs">Estimate only - verification required for official credits</span>
                    </div>
                    <Button
                      className="w-full bg-white text-primary hover:bg-white/90"
                      size="sm"
                      onClick={() => navigate(`/carbon/verify-transaction/${transaction.id}`)}
                    >
                      Start Verification Process
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionDetail;
