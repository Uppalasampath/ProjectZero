import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Recycle,
  ShieldCheck,
  ArrowRight,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import zeroLogo from "@/assets/zero-logo.png";
import ComplianceSection from "@/components/landing/ComplianceSection";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "You're on the list",
      description: "We'll be in touch soon with early access details.",
    });

    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <img src={zeroLogo} alt="ZERO" className="h-8 w-8 object-contain" />
            <span className="text-xl font-semibold text-neutral-900 tracking-tight">ZERO</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              onClick={() => navigate("/login")}
            >
              Join Beta
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-50 border border-neutral-200 mb-8">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-neutral-600">Currently in Private Beta</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-light text-neutral-900 mb-6 tracking-tight leading-[1.1]">
              Sustainability
              <br />
              <span className="font-normal">made operational</span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Platform for enterprise carbon management, circular economy, and compliance automation
            </p>

            {/* Waitlist Form */}
            <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto mb-6">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-6 bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </Button>
              </div>
            </form>

            <p className="text-sm text-neutral-400">
              Early access for qualifying organizations
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-neutral-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

            {/* Carbon */}
            <div className="group">
              <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-6 group-hover:border-neutral-900 transition-colors">
                <img src={zeroLogo} alt="Carbon" className="h-6 w-6 object-contain" />
              </div>
              <h3 className="text-xl font-medium text-neutral-900 mb-3">Carbon Management</h3>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Track emissions across Scope 1, 2, and 3. Set reduction targets. Monitor progress.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>Real-time tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>Target management</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>Supplier collaboration</span>
                </li>
              </ul>
            </div>

            {/* Circular Economy */}
            <div className="group">
              <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-6 group-hover:border-neutral-900 transition-colors">
                <Recycle className="h-6 w-6 text-neutral-900" />
              </div>
              <h3 className="text-xl font-medium text-neutral-900 mb-3">Circular Marketplace</h3>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Transform waste streams into value. Connect with buyers and sellers in the circular economy.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>Material exchange</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>Transaction tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>Impact measurement</span>
                </li>
              </ul>
            </div>

            {/* Compliance */}
            <div className="group">
              <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-6 group-hover:border-neutral-900 transition-colors">
                <ShieldCheck className="h-6 w-6 text-neutral-900" />
              </div>
              <h3 className="text-xl font-medium text-neutral-900 mb-3">Compliance Automation</h3>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Automated reporting for major sustainability frameworks. Audit-ready documentation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>CSRD, CDP, GRI support</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>Auto-populated reports</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>Regulatory monitoring</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Platform Integration */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6 leading-tight">
                One platform,
                <br />
                <span className="font-normal">complete visibility</span>
              </h2>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                All sustainability data flows through a single system. Carbon reductions from marketplace
                activities automatically update compliance reports. No manual reconciliation.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-neutral-900"></div>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 mb-1">Unified data model</p>
                    <p className="text-sm text-neutral-600">Single source of truth for all sustainability metrics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-neutral-900"></div>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 mb-1">Real-time sync</p>
                    <p className="text-sm text-neutral-600">Data flows automatically between modules</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-neutral-900"></div>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 mb-1">Audit trail</p>
                    <p className="text-sm text-neutral-600">Complete tracking of all data changes and sources</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 space-y-6">
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-neutral-600">Carbon Footprint</span>
                    <span className="text-xs text-neutral-400">Updated 2m ago</span>
                  </div>
                  <p className="text-3xl font-light text-neutral-900 mb-1">12,450 <span className="text-lg text-neutral-500">tCO2e</span></p>
                  <p className="text-sm text-green-600">↓ 8.2% vs last quarter</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-neutral-600">Circularity</span>
                    <span className="text-xs text-neutral-400">Live</span>
                  </div>
                  <p className="text-3xl font-light text-neutral-900 mb-1">4,280 <span className="text-lg text-neutral-500">tons</span></p>
                  <p className="text-sm text-neutral-500">waste diverted this month</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-neutral-600">Compliance</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 border border-green-200">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-700">Current</span>
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">CSRD, CDP, GRI reports ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <ComplianceSection />

      {/* CTA Section */}
      <section className="py-24 bg-neutral-900">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Built for enterprise scale
          </h2>
          <p className="text-xl text-neutral-400 mb-12 font-light">
            Request early access to join leading organizations transforming their sustainability operations
          </p>

          <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-6 bg-white hover:bg-neutral-100 text-neutral-900"
              >
                Request Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-12 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-medium text-neutral-900 mb-4 text-sm">Platform</h4>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                <li className="hover:text-neutral-900 cursor-pointer">Carbon</li>
                <li className="hover:text-neutral-900 cursor-pointer">Marketplace</li>
                <li className="hover:text-neutral-900 cursor-pointer">Compliance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-4 text-sm">Resources</h4>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                <li className="hover:text-neutral-900 cursor-pointer">Documentation</li>
                <li className="hover:text-neutral-900 cursor-pointer">API</li>
                <li className="hover:text-neutral-900 cursor-pointer">Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                <li className="hover:text-neutral-900 cursor-pointer">About</li>
                <li className="hover:text-neutral-900 cursor-pointer">Careers</li>
                <li className="hover:text-neutral-900 cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-4 text-sm">Legal</h4>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                <li className="hover:text-neutral-900 cursor-pointer">Privacy</li>
                <li className="hover:text-neutral-900 cursor-pointer">Terms</li>
                <li className="hover:text-neutral-900 cursor-pointer">Security</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={zeroLogo} alt="ZERO" className="h-6 w-6 object-contain" />
              <span className="text-sm font-medium text-neutral-900">ZERO</span>
            </div>
            <p className="text-sm text-neutral-500">© 2024 ZERO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
