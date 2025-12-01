import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';
import zeroLogo from '@/assets/zero-logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
    } else {
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in'
      });
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-8">
              <img src={zeroLogo} alt="ZERO" className="h-8 w-8 object-contain" />
              <span className="text-xl font-semibold text-neutral-900">ZERO</span>
            </Link>
            <h1 className="text-3xl font-light text-neutral-900 mb-2">Welcome back</h1>
            <p className="text-neutral-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-900 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 border-neutral-300 focus:border-neutral-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-600"
                >
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-neutral-600 hover:text-neutral-900">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-neutral-900 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-neutral-50 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-neutral-600">Enterprise Platform</span>
            </div>
            <h2 className="text-4xl font-light text-neutral-900 leading-tight">
              Sustainability
              <br />
              <span className="font-normal">made operational</span>
            </h2>
            <p className="text-lg text-neutral-600">
              Track carbon emissions, manage circular economy initiatives, and automate compliance reporting.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Real-time emissions tracking',
              'Circular marketplace integration',
              'Automated compliance reports'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-neutral-700">
                <div className="h-5 w-5 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-neutral-900"></div>
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
