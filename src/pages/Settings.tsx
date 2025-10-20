import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, Check, X } from "lucide-react";

const Settings = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="team">Team Management</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Update your company information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">AM</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Company Name</Label>
                    <Input defaultValue="Acme Manufacturing" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Industry</Label>
                    <Input defaultValue="Manufacturing" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Company Size</Label>
                      <Input defaultValue="1000-5000 employees" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Net-Zero Target Year</Label>
                      <Input defaultValue="2045" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Headquarters Location</Label>
                    <Input defaultValue="Detroit, MI, USA" />
                  </div>
                </div>
                <Button className="bg-gradient-primary">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>ERP & Data Integrations</CardTitle>
                <CardDescription>Connect your business systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "SAP", status: "connected", description: "Financial and operational data" },
                  { name: "Oracle", status: "connected", description: "Supply chain and inventory" },
                  { name: "Workday", status: "connected", description: "HR and employee data" },
                  { name: "QuickBooks", status: "disconnected", description: "Accounting and expenses" },
                  { name: "Salesforce", status: "disconnected", description: "Customer relationship data" },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {integration.name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    {integration.status === "connected" ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-success">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                    ) : (
                      <Button className="bg-gradient-primary">Connect</Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage user access and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", email: "sarah@acme.com", role: "Admin" },
                    { name: "Michael Chen", email: "michael@acme.com", role: "Editor" },
                    { name: "Emily Rodriguez", email: "emily@acme.com", role: "Viewer" },
                    { name: "David Kim", email: "david@acme.com", role: "Editor" },
                  ].map((member) => (
                    <div key={member.email} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{member.role}</Badge>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-gradient-primary mt-4">Invite Team Member</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: "Marketplace Transactions", description: "New waste matches and transaction updates" },
                  { title: "Carbon Calculations", description: "Emission recalculations and reports" },
                  { title: "Compliance Deadlines", description: "Upcoming regulatory deadlines and reminders" },
                  { title: "Team Activity", description: "Team member actions and updates" },
                  { title: "Product Updates", description: "New features and platform improvements" },
                ].map((notif) => (
                  <div key={notif.title} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-sm text-muted-foreground">{notif.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>Manage your plan and payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 border-2 border-primary rounded-lg bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">Professional Plan</h3>
                      <p className="text-muted-foreground">Full access to all modules</p>
                    </div>
                    <Badge className="bg-success">Active</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-4">$499<span className="text-base font-normal text-muted-foreground">/month</span></p>
                  <Button className="w-full bg-gradient-primary">Upgrade to Enterprise</Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Plan Includes:</h4>
                  <ul className="space-y-2">
                    {[
                      "Unlimited waste listings",
                      "Advanced carbon analytics",
                      "All compliance frameworks",
                      "10 team members",
                      "Priority support",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
