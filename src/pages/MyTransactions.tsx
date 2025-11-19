import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useState } from "react";

const MyTransactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all transactions where user is buyer or seller
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['my-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          material:waste_materials(material_type, material_subtype, quantity, unit),
          buyer:buyer_id(company_name),
          seller:seller_id(company_name)
        `)
        .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Filter transactions by tab
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (activeTab === "all") return transactions;
    return transactions.filter(t => t.status === activeTab);
  }, [transactions, activeTab]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!transactions) return { revenue: 0, materialsDiverted: 0, carbonCredits: 0, transactionCount: 0 };

    const completedTransactions = transactions.filter(t => t.status === 'completed');

    // Calculate revenue from sales where user is the seller
    const revenue = completedTransactions
      .filter(t => t.seller_id === user?.id)
      .reduce((sum, t) => sum + (t.total_amount || 0), 0);

    // Calculate materials diverted (all completed transactions)
    const materialsDiverted = completedTransactions
      .reduce((sum, t) => sum + (t.quantity || 0), 0);

    // Calculate carbon credits generated
    const carbonCredits = completedTransactions
      .reduce((sum, t) => sum + (t.carbon_credits_generated || 0), 0);

    return {
      revenue,
      materialsDiverted,
      carbonCredits,
      transactionCount: completedTransactions.length,
    };
  }, [transactions, user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success";
      case "active": return "bg-primary";
      case "pending": return "bg-warning";
      default: return "bg-muted";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Transactions</h1>
            <p className="text-muted-foreground mt-1">Track your circular marketplace activity</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {activeTab !== "all" ? activeTab : ""} transactions found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Counterparty</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => {
                        const isSeller = transaction.seller_id === user?.id;
                        const counterparty = isSeller
                          ? (transaction.buyer as any)?.company_name || 'Unknown Buyer'
                          : (transaction.seller as any)?.company_name || 'Unknown Seller';
                        const materialName = (transaction.material as any)?.material_type || 'Unknown Material';
                        const materialQuantity = (transaction.material as any)?.quantity || transaction.quantity;
                        const materialUnit = (transaction.material as any)?.unit || 'tons';

                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {transaction.id.substring(0, 8)}
                            </TableCell>
                            <TableCell>{formatDate(transaction.created_at || '')}</TableCell>
                            <TableCell>{materialName}</TableCell>
                            <TableCell>{transaction.quantity} {materialUnit}</TableCell>
                            <TableCell>{counterparty}</TableCell>
                            <TableCell>
                              <Badge variant={isSeller ? "default" : "secondary"}>
                                {isSeller ? "Sell" : "Buy"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(transaction.status || 'pending')}>
                                {transaction.status || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-success">
                              ${transaction.total_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/transactions/${transaction.id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">
                ${metrics.revenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                From {metrics.transactionCount} completed {metrics.transactionCount === 1 ? 'transaction' : 'transactions'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Materials Diverted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metrics.materialsDiverted.toFixed(1)} tons</p>
              <p className="text-sm text-muted-foreground mt-1">Completed transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Estimated Carbon Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">~{metrics.carbonCredits.toFixed(1)} tons</p>
              <p className="text-sm text-muted-foreground mt-1">Estimated CO2e avoided (pending verification)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MyTransactions;
