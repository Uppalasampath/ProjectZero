import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const transactions = [
  { id: "TRX-001", date: "2024-01-15", material: "Industrial Steel Scrap", quantity: "150 tons", counterparty: "Regional Recycling Co.", status: "completed", amount: "$67,500", type: "sell" },
  { id: "TRX-002", date: "2024-01-18", material: "HDPE Plastic Pellets", quantity: "80 tons", counterparty: "GreenTech Industries", status: "active", amount: "$25,600", type: "sell" },
  { id: "TRX-003", date: "2024-01-20", material: "Organic Waste Compost", quantity: "200 tons", counterparty: "Urban Farms LLC", status: "pending", amount: "$36,000", type: "sell" },
  { id: "TRX-004", date: "2024-01-12", material: "Aluminum Cans", quantity: "50 tons", counterparty: "Metal Recovery Inc.", status: "completed", amount: "$42,500", type: "buy" },
];

const MyTransactions = () => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success";
      case "active": return "bg-primary";
      case "pending": return "bg-warning";
      default: return "bg-muted";
    }
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

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Counterparty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.material}</TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>{transaction.counterparty}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-success">{transaction.amount}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/transaction/${transaction.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {transaction.status === "active" && (
                              <Button size="sm" variant="outline">
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Showing active transactions only</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Showing pending transactions only</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Showing completed transactions only</p>
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
              <p className="text-3xl font-bold text-success">$129,100</p>
              <p className="text-sm text-muted-foreground mt-1">From 8 transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Materials Diverted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">480 tons</p>
              <p className="text-sm text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Carbon Credits Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">152 tons</p>
              <p className="text-sm text-muted-foreground mt-1">CO2e avoided</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MyTransactions;
