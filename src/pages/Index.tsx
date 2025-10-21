import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Recycle, 
  ShieldCheck, 
  TrendingDown,
  Globe2,
  Factory,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import forestHero from "@/assets/forest-hero.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-eco flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">ZERO</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button className="bg-gradient-eco" onClick={() => navigate("/signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(50, 35, 20, 0.4), rgba(30, 25, 15, 0.6)), url(${forestHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-success/20 text-white border-success/30 hover:bg-success/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Enterprise Sustainability Platform
            </Badge>
            <h1 className="text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              Achieve Net <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">ZERO</span>
              <br />With Confidence
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              The all-in-one platform for enterprise sustainability. Track carbon, transform waste into revenue, 
              and automate compliance reporting—all in one place.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg h-14 px-8 shadow-xl" onClick={() => navigate("/signup")}>
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20 max-w-5xl mx-auto">
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-6">
              <p className="text-5xl font-bold text-white mb-2 drop-shadow-lg">500+</p>
              <p className="text-white/80">Enterprise Clients</p>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-6">
              <p className="text-5xl font-bold text-white mb-2 drop-shadow-lg">2.5M</p>
              <p className="text-white/80">Tons CO2 Reduced</p>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-6">
              <p className="text-5xl font-bold text-white mb-2 drop-shadow-lg">$180M</p>
              <p className="text-white/80">Revenue from Circularity</p>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-6">
              <p className="text-5xl font-bold text-white mb-2 drop-shadow-lg">98%</p>
              <p className="text-white/80">Compliance Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Three Powerful Engines, One Platform</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ZERO unifies carbon tracking, circular economy, and compliance automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Carbon Engine */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Carbon Engine</h3>
                <p className="text-muted-foreground mb-6">
                  Measure, track, and reduce your carbon footprint across all three scopes with AI-powered insights.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Real-time emissions tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Scope 1, 2, and 3 coverage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Science-based target alignment</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Circular Marketplace */}
            <Card className="border-2 border-success/20 hover:border-success/40 transition-all hover:shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center mb-6">
                  <Recycle className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Circular Marketplace</h3>
                <p className="text-muted-foreground mb-6">
                  Turn waste into revenue streams by connecting with buyers and sellers in our circular economy network.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">List and discover materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Automated matching & pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Impact tracking & reporting</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Compliance Autopilot */}
            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all hover:shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Compliance Hub</h3>
                <p className="text-muted-foreground mb-6">
                  Automate ESG and regulatory reporting with data pulled directly from your operations.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">CSRD, CDP, GRI frameworks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Auto-populated reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Audit-ready documentation</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-eco rounded-3xl p-12 text-primary-foreground">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-4">Everything Syncs Automatically</h2>
                <p className="text-xl opacity-90 mb-8">
                  ZERO integrates all your sustainability data in real-time. Carbon reductions from marketplace 
                  activities automatically update compliance reports. No manual data entry. No silos.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <span className="text-lg">Real-time carbon impact tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <span className="text-lg">Unified analytics dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Globe2 className="h-5 w-5" />
                    </div>
                    <span className="text-lg">Multi-framework compliance</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-background/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                  <div className="space-y-6">
                    <div className="bg-white/90 text-foreground rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Factory className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Marketplace Activity</span>
                      </div>
                      <p className="text-3xl font-bold">8,200 tons</p>
                      <p className="text-sm text-muted-foreground">waste diverted this month</p>
                    </div>
                    <div className="flex gap-4">
                      <ArrowRight className="h-6 w-6 mt-8 animate-pulse" />
                    </div>
                    <div className="bg-white/90 text-foreground rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck className="h-5 w-5 text-accent" />
                        <span className="font-semibold">CSRD Report</span>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20">
                        Auto-updated
                      </Badge>
                      <p className="text-sm mt-2 text-muted-foreground">E5 metrics synced automatically</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Achieve Net Zero?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join leading enterprises transforming their sustainability journey with ZERO.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-eco text-lg h-14 px-8" onClick={() => navigate("/signup")}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • 14-day free trial • Full platform access
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-eco flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">ZERO</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise sustainability platform for net zero transformation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Carbon Engine</li>
                <li>Circular Marketplace</li>
                <li>Compliance Hub</li>
                <li>Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentation</li>
                <li>Case Studies</li>
                <li>Blog</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 ZERO Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
