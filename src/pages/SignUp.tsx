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
  const [selectedModules] = useState(['marketplace', 'carbon', 'compliance']);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg space-y-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-neutral-900">ZERO</span>
            </Link>
            <h1 className="text-3xl font-light text-neutral-900 mb-2">Create account</h1>
            <p className="text-neutral-600">
              Step {step} of 4 · {step === 1 ? 'Account details' : step === 2 ? 'Company information' : step === 3 ? 'Sustainability goals' : 'Confirm and launch'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-neutral-900' : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-900 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 border-neutral-300 focus:border-neutral-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-neutral-900 font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 border-neutral-300 focus:border-neutral-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-neutral-900 font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-11 border-neutral-300 focus:border-neutral-900"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-neutral-600">
                    I agree to the{' '}
                    <a href="#" className="text-neutral-900 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-neutral-900 hover:underline">Privacy Policy</a>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-sm text-neutral-600">
                Already have an account?{' '}
                <Link to="/login" className="text-neutral-900 font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-neutral-900 font-medium">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="companyName"
                      placeholder="Acme Corporation"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-10 h-11 border-neutral-300 focus:border-neutral-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-neutral-900 font-medium">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry} required>
                    <SelectTrigger className="h-11 border-neutral-300">
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
                    <Label className="text-neutral-900 font-medium">Company Size</Label>
                    <Select value={companySize} onValueChange={setCompanySize} required>
                      <SelectTrigger className="h-11 border-neutral-300">
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
                    <Label className="text-neutral-900 font-medium">Annual Revenue</Label>
                    <Select value={revenueRange} onValueChange={setRevenueRange} required>
                      <SelectTrigger className="h-11 border-neutral-300">
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
                  <Label htmlFor="headquarters" className="text-neutral-900 font-medium">Headquarters Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="headquarters"
                      placeholder="City, Country"
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      className="pl-10 h-11 border-neutral-300 focus:border-neutral-900"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-11 border-neutral-300"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1 h-11 bg-neutral-900 hover:bg-neutral-800 text-white">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-neutral-900 font-medium">Net Zero Target Year</Label>
                  <div className="flex items-center gap-4 pt-2">
                    <input
                      type="range"
                      min="2025"
                      max="2050"
                      value={netZeroYear}
                      onChange={(e) => setNetZeroYear(Number(e.target.value))}
                      className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                    />
                    <span className="text-2xl font-light text-neutral-900 w-20 text-right">{netZeroYear}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-neutral-900 font-medium">Current Status (select all that apply)</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'baseline', label: 'We have carbon baseline' },
                      { id: 'esg', label: 'We report ESG data' },
                      { id: 'team', label: 'We have sustainability team' },
                      { id: 'none', label: 'None of the above' }
                    ].map(({ id, label }) => (
                      <div
                        key={id}
                        onClick={() => toggleStatus(id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          currentStatus.includes(id)
                            ? 'border-neutral-900 bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                            currentStatus.includes(id) ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300'
                          }`}>
                            {currentStatus.includes(id) && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="text-sm text-neutral-900">{label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-neutral-900 font-medium">Primary Goal</Label>
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
                            ? 'border-neutral-900 bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900">{label}</div>
                            <div className="text-sm text-neutral-600">{desc}</div>
                          </div>
                          {primaryGoal === value && <Check className="h-5 w-5 text-neutral-900" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 h-11 border-neutral-300"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1 h-11 bg-neutral-900 hover:bg-neutral-800 text-white">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-neutral-900 font-medium">Platform Modules</Label>
                <div className="grid gap-3">
                  {[
                    {
                      id: 'marketplace',
                      title: 'Circular Marketplace',
                      desc: 'Turn waste into revenue'
                    },
                    {
                      id: 'carbon',
                      title: 'Carbon Management',
                      desc: 'Measure and reduce emissions'
                    },
                    {
                      id: 'compliance',
                      title: 'Compliance Automation',
                      desc: 'Automate ESG reporting'
                    }
                  ].map(({ id, title, desc }) => (
                    <div
                      key={id}
                      className="p-4 border border-neutral-200 rounded-lg bg-neutral-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-neutral-900">{title}</div>
                          <div className="text-sm text-neutral-600">{desc}</div>
                        </div>
                        <div className="h-5 w-5 rounded border bg-neutral-900 border-neutral-900 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-neutral-100 border border-neutral-200 rounded-lg mt-4">
                  <div className="text-sm font-medium text-neutral-900 mb-1">Subscription: Starter</div>
                  <div className="text-xs text-neutral-600">
                    All three modules included. Upgrade anytime for advanced features.
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="flex-1 h-11 border-neutral-300"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-neutral-900 hover:bg-neutral-800 text-white"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Get Started'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-neutral-50 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-neutral-600">Private Beta</span>
            </div>
            <h2 className="text-4xl font-light text-neutral-900 leading-tight">
              Join leading
              <br />
              <span className="font-normal">organizations</span>
            </h2>
            <p className="text-lg text-neutral-600">
              Enterprise sustainability platform built for scale, accuracy, and compliance.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="text-sm font-medium text-neutral-900 mb-1">Complete Platform</div>
              <div className="text-xs text-neutral-600">Carbon tracking, circular economy & compliance in one system</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="text-sm font-medium text-neutral-900 mb-1">Real-time Data</div>
              <div className="text-xs text-neutral-600">Automated sync across all modules with audit trails</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="text-sm font-medium text-neutral-900 mb-1">Enterprise Ready</div>
              <div className="text-xs text-neutral-600">Built for organizations with complex sustainability needs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
