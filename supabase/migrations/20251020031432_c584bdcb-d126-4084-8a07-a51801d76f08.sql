-- Create organization members table for enterprise features
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  department TEXT,
  job_title TEXT,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  team_lead UUID REFERENCES auth.users(id),
  department TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team members junction table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_members
CREATE POLICY "Users can view members in their organization"
  ON public.organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ) OR organization_id = auth.uid()
  );

CREATE POLICY "Organization owners can manage members"
  ON public.organization_members FOR ALL
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- RLS Policies for teams
CREATE POLICY "Users can view teams in their organization"
  ON public.teams FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ) OR organization_id = auth.uid()
  );

CREATE POLICY "Organization owners can manage teams"
  ON public.teams FOR ALL
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- RLS Policies for team_members
CREATE POLICY "Users can view team members in their organization"
  ON public.team_members FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM public.teams WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      ) OR organization_id = auth.uid()
    )
  );

CREATE POLICY "Team leads can manage their team members"
  ON public.team_members FOR ALL
  USING (
    team_id IN (
      SELECT id FROM public.teams WHERE team_lead = auth.uid() OR organization_id = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams WHERE team_lead = auth.uid() OR organization_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_teams_org ON public.teams(organization_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);

-- Create trigger for updated_at on teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();