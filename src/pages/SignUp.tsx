import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Mail, Lock, Building2, MapPin, ArrowRight, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [revenueRange, setRevenueRange] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [netZeroYear, setNetZeroYear] = useState(2040);
  const [currentStatus, setCurrentStatus] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [selectedModules, setSelectedModules] = useState(['marketplace', 'carbon', 'compliance']);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = (step / 4) * 100;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters',
        variant: 'destructive'
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the terms of service',
        variant: 'destructive'
      });
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName || !industry || !companySize || !revenueRange || !headquarters) {
      toast({
        title: 'Incomplete Information',
        description: 'Please fill in all company details',
        variant: 'destructive'
      });
      return;
    }

    setStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!primaryGoal) {
      toast({
        title: 'Goal Required',
        description: 'Please select your primary goal',
        variant: 'destructive'
      });
      return;
    }

    setStep(4);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    const userData = {
      company_name: companyName,
      industry,
      company_size: companySize,
      revenue_range: revenueRange,
      headquarters_location: headquarters,
      net_zero_target_year: netZeroYear,
      subscription_tier: 'starter'
    };

    const { error } = await signUp(email, password, userData);
    
    if (error) {
      toast({
        title: 'Sign Up Failed',
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
    } else {
      toast({
        title: 'Account Created!',
        description: 'Welcome to ZERO'
      });
      navigate('/onboarding');
    }
  };

  const toggleStatus = (status: string) => {
    setCurrentStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Join ZERO</h1>
          <p className="text-muted-foreground mt-2">Create your sustainability management account</p>
        </div>

        <Progress value={progress} className="h-2" />

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                    <SelectItem value="chemicals">Chemicals</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="textiles">Textiles</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
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
                  <Label>Annual Revenue</Label>
                  <Select value={revenueRange} onValueChange={setRevenueRange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
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

              <div className="space-y-2">
                <Label htmlFor="headquarters">Headquarters Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="headquarters"
                    placeholder="City, Country"
                    value={headquarters}
                    onChange={(e) => setHeadquarters(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                Back
              </Button>
              <Button type="submit" className="w-full">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3Submit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Net Zero Target Year</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="2025"
                    max="2050"
                    value={netZeroYear}
                    onChange={(e) => setNetZeroYear(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold w-20">{netZeroYear}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Status (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'baseline', label: 'We have carbon baseline' },
                    { id: 'esg', label: 'We report ESG data' },
                    { id: 'team', label: 'We have sustainability team' },
                    { id: 'none', label: 'None of the above' }
                  ].map(({ id, label }) => (
                    <div
                      key={id}
                      onClick={() => toggleStatus(id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        currentStatus.includes(id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {currentStatus.includes(id) && <Check className="h-4 w-4 text-primary" />}
                        <span className="text-sm">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Goal</Label>
                <div className="grid gap-2">
                  {[
                    { value: 'compliance', label: 'Compliance', desc: 'Meet regulatory requirements' },
                    { value: 'cost', label: 'Cost Reduction', desc: 'Reduce operational costs' },
                    { value: 'both', label: 'Both Equally', desc: 'Compliance + Cost savings' }
                  ].map(({ value, label, desc }) => (
                    <div
                      key={value}
                      onClick={() => setPrimaryGoal(value)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        primaryGoal === value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{label}</div>
                          <div className="text-sm text-muted-foreground">{desc}</div>
                        </div>
                        {primaryGoal === value && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full">
                Back
              </Button>
              <Button type="submit" className="w-full">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Select Modules (all selected by default)</Label>
              <div className="grid gap-4">
                {[
                  {
                    id: 'marketplace',
                    title: 'Circular Marketplace',
                    desc: 'Turn waste into revenue'
                  },
                  {
                    id: 'carbon',
                    title: 'Carbon Engine',
                    desc: 'Measure and reduce emissions'
                  },
                  {
                    id: 'compliance',
                    title: 'Compliance Autopilot',
                    desc: 'Automate ESG reporting'
                  }
                ].map(({ id, title, desc }) => (
                  <div
                    key={id}
                    className="p-4 border rounded-lg border-primary bg-primary/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{title}</div>
                        <div className="text-sm text-muted-foreground">{desc}</div>
                      </div>
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Subscription Tier: Starter</div>
                <div className="text-xs text-muted-foreground">
                  All three modules included. Upgrade anytime for advanced features.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(3)} className="w-full">
                Back
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Get Started'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
