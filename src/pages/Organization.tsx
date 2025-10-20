import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Shield, 
  MoreVertical,
  Leaf,
  TrendingUp,
  Target,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Organization() {
  const { user } = useAuth();

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch organization members
  const { data: members } = useQuery({
    queryKey: ['organization-members', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch teams
  const { data: teams } = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('organization_id', user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Demo data for members (you'll replace this with real data)
  const demoMembers = [
    { name: "Sarah Chen", role: "Sustainability Director", department: "ESG", email: "sarah.chen@company.com", status: "active" },
    { name: "Michael Rodriguez", role: "Carbon Analyst", department: "Carbon", email: "michael.r@company.com", status: "active" },
    { name: "Emily Watson", role: "Compliance Manager", department: "Compliance", email: "emily.w@company.com", status: "active" },
    { name: "David Kim", role: "Circular Economy Lead", department: "Operations", email: "david.k@company.com", status: "active" },
    { name: "Lisa Thompson", role: "Data Analyst", department: "Analytics", email: "lisa.t@company.com", status: "active" }
  ];

  const demoTeams = [
    { name: "Carbon Accounting Team", members: 4, lead: "Sarah Chen", department: "Carbon" },
    { name: "Compliance Team", members: 3, lead: "Emily Watson", department: "Compliance" },
    { name: "Marketplace Operations", members: 5, lead: "David Kim", department: "Operations" }
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Organization Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-primary flex items-center justify-center shadow-eco">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile?.company_name || 'Your Organization'}</h1>
              <p className="text-muted-foreground mt-1">
                {profile?.industry || 'Manufacturing'} • {profile?.headquarters_location || 'San Francisco, CA'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Invite Members
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-3xl font-bold">{members?.length || 5}</p>
                </div>
                <Users className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/20 bg-gradient-to-br from-success/5 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Teams</p>
                  <p className="text-3xl font-bold">{teams?.length || 3}</p>
                </div>
                <Target className="h-10 w-10 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-success/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Zero Target</p>
                  <p className="text-3xl font-bold">{profile?.net_zero_target_year || 2040}</p>
                </div>
                <Leaf className="h-10 w-10 text-accent opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-chart-4/20 bg-gradient-to-br from-chart-4/5 to-chart-2/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tier</p>
                  <p className="text-2xl font-bold capitalize">{profile?.subscription_tier || 'Starter'}</p>
                </div>
                <Award className="h-10 w-10 text-chart-4 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your organization's team members and their roles</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search members..." className="pl-9 w-64" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {member.department}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        <Badge variant="default" className="bg-success/10 text-success border-success/20">
                          Active
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {demoTeams.map((team, index) => (
                <Card key={index} className="hover:shadow-eco transition-shadow cursor-pointer border-2 hover:border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {team.name}
                      <Badge variant="secondary">{team.members} members</Badge>
                    </CardTitle>
                    <CardDescription>Led by {team.lead}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Department</span>
                        <Badge variant="outline">{team.department}</Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        View Team Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Manage your organization's profile and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input defaultValue={profile?.company_name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input defaultValue={profile?.industry} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select defaultValue={profile?.company_size}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">1-50 employees</SelectItem>
                        <SelectItem value="medium">51-200 employees</SelectItem>
                        <SelectItem value="large">201-1000 employees</SelectItem>
                        <SelectItem value="enterprise">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Headquarters</Label>
                    <Input defaultValue={profile?.headquarters_location} />
                  </div>
                  <div className="space-y-2">
                    <Label>Net Zero Target Year</Label>
                    <Input type="number" defaultValue={profile?.net_zero_target_year} />
                  </div>
                  <div className="space-y-2">
                    <Label>Revenue Range</Label>
                    <Select defaultValue={profile?.revenue_range}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10m-50m">$10M-$50M</SelectItem>
                        <SelectItem value="50m-150m">$50M-$150M</SelectItem>
                        <SelectItem value="150m-500m">$150M-$500M</SelectItem>
                        <SelectItem value="500m-1b">$500M-$1B</SelectItem>
                        <SelectItem value="1b+">$1B+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}