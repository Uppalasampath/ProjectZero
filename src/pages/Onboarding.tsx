import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Database, Calculator, FileText, ArrowRight, Check, Upload, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [facilities, setFacilities] = useState('');
  const [energyConsumption, setEnergyConsumption] = useState('');
  const [generatesWaste, setGeneratesWaste] = useState<boolean | null>(null);
  const [wasteAmount, setWasteAmount] = useState('');
  const [tracksEmissions, setTracksEmissions] = useState<boolean | null>(null);
  const [currentFootprint, setCurrentFootprint] = useState('');
  const [baseline, setBaseline] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDataSourceSkip = () => {
    setStep(2);
  };

  const handleBaselineSubmit = async () => {
    // Simple baseline calculation based on inputs
    const facilityCount = parseInt(facilities) || 1;
    const energy = parseFloat(energyConsumption) || 1000;
    const waste = parseFloat(wasteAmount) || 0;
    
    // Rough estimation: 0.5 tons CO2e per MWh + facility factor
    const estimatedBaseline = (energy * 0.0005) * facilityCount + waste * 0.3;
    
    setBaseline(Math.round(estimatedBaseline));
    setStep(3);
  };

  const handleGoalSelection = async (goal: string) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        });

      setShowConfetti(true);
      
      setTimeout(() => {
        if (goal === 'list-waste') {
          navigate('/list-waste');
        } else if (goal === 'calculate') {
          navigate('/carbon');
        } else if (goal === 'compliance') {
          navigate('/compliance');
        } else {
          navigate('/dashboard');
        }
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="w-full max-w-3xl space-y-8">
        {step === 0 && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-neutral-900" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-light text-neutral-900 mb-4">Welcome to ZERO!</h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Your enterprise sustainability management platform is ready. Let's set up your account in just a few steps.
              </p>
            </div>
            <Button size="lg" onClick={() => setStep(1)} className="bg-neutral-900 hover:bg-neutral-800">
              Let's Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-light text-neutral-900 mb-2">Connect Data Sources</h2>
              <p className="text-neutral-600">Optional: Connect your systems for automatic data sync</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'SAP', logo: '🔷' },
                { name: 'Oracle', logo: '🔴' },
                { name: 'NetSuite', logo: '🟦' },
                { name: 'Microsoft Dynamics', logo: '🟩' }
              ].map((erp) => (
                <Card key={erp.name} className="p-6 border border-neutral-200 bg-white shadow-none hover:border-neutral-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{erp.logo}</div>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">{erp.name}</div>
                      <div className="text-sm text-neutral-600">ERP Integration</div>
                    </div>
                    <Button size="sm" variant="outline" className="border-neutral-300 text-neutral-900 hover:bg-neutral-50">Connect</Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors cursor-pointer bg-white">
              <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
              <div className="font-medium text-neutral-900 mb-1">Upload Utility Bills</div>
              <div className="text-sm text-neutral-600">Drag and drop or click to upload energy bills</div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleDataSourceSkip} className="flex-1 border-neutral-300 text-neutral-900 hover:bg-neutral-50">
                Skip for Now
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1 bg-neutral-900 hover:bg-neutral-800">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-light text-neutral-900 mb-2">Baseline Assessment</h2>
              <p className="text-neutral-600">Quick questionnaire to estimate your carbon footprint</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facilities" className="text-neutral-900 font-medium">How many facilities do you operate?</Label>
                <Input
                  id="facilities"
                  type="number"
                  placeholder="e.g., 3"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  className="border-neutral-300 focus:border-neutral-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="energy" className="text-neutral-900 font-medium">Approximate annual energy consumption (kWh)</Label>
                <Input
                  id="energy"
                  type="number"
                  placeholder="e.g., 500000"
                  value={energyConsumption}
                  onChange={(e) => setEnergyConsumption(e.target.value)}
                  className="border-neutral-300 focus:border-neutral-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-900 font-medium">Do you generate industrial waste?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={generatesWaste === true ? 'default' : 'outline'}
                    onClick={() => setGeneratesWaste(true)}
                    className={`flex-1 ${generatesWaste === true ? 'bg-neutral-900 hover:bg-neutral-800' : 'border-neutral-300 text-neutral-900 hover:bg-neutral-50'}`}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={generatesWaste === false ? 'default' : 'outline'}
                    onClick={() => setGeneratesWaste(false)}
                    className={`flex-1 ${generatesWaste === false ? 'bg-neutral-900 hover:bg-neutral-800' : 'border-neutral-300 text-neutral-900 hover:bg-neutral-50'}`}
                  >
                    No
                  </Button>
                </div>
              </div>

              {generatesWaste && (
                <div className="space-y-2">
                  <Label htmlFor="waste" className="text-neutral-900 font-medium">Approximate monthly waste (tons)</Label>
                  <Input
                    id="waste"
                    type="number"
                    placeholder="e.g., 50"
                    value={wasteAmount}
                    onChange={(e) => setWasteAmount(e.target.value)}
                    className="border-neutral-300 focus:border-neutral-900"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-neutral-900 font-medium">Do you currently track carbon emissions?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={tracksEmissions === true ? 'default' : 'outline'}
                    onClick={() => setTracksEmissions(true)}
                    className={`flex-1 ${tracksEmissions === true ? 'bg-neutral-900 hover:bg-neutral-800' : 'border-neutral-300 text-neutral-900 hover:bg-neutral-50'}`}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={tracksEmissions === false ? 'default' : 'outline'}
                    onClick={() => setTracksEmissions(false)}
                    className={`flex-1 ${tracksEmissions === false ? 'bg-neutral-900 hover:bg-neutral-800' : 'border-neutral-300 text-neutral-900 hover:bg-neutral-50'}`}
                  >
                    No
                  </Button>
                </div>
              </div>

              {tracksEmissions && (
                <div className="space-y-2">
                  <Label htmlFor="footprint" className="text-neutral-900 font-medium">Current annual footprint (tons CO2e)</Label>
                  <Input
                    id="footprint"
                    type="number"
                    placeholder="e.g., 1200"
                    value={currentFootprint}
                    onChange={(e) => setCurrentFootprint(e.target.value)}
                    className="border-neutral-300 focus:border-neutral-900"
                  />
                </div>
              )}
            </div>

            <Button onClick={handleBaselineSubmit} className="w-full bg-neutral-900 hover:bg-neutral-800" size="lg">
              Calculate My Baseline <Calculator className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && baseline && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                <Check className="h-8 w-8 text-neutral-900" />
              </div>
              <h2 className="text-3xl font-light text-neutral-900 mb-2">Your Estimated Baseline</h2>
              <div className="text-6xl font-light text-neutral-900 my-6">{baseline.toLocaleString()}</div>
              <div className="text-xl text-neutral-600">tons CO2e annually</div>
            </div>

            <Card className="p-6 bg-neutral-100 border border-neutral-200 shadow-none">
              <div className="text-sm text-neutral-700">
                This is a rough estimate based on your inputs. For a detailed carbon footprint calculation,
                visit the Carbon Engine module after setup.
              </div>
            </Card>

            <Button onClick={() => setStep(4)} className="w-full bg-neutral-900 hover:bg-neutral-800" size="lg">
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-light text-neutral-900 mb-2">Set Up Your First Goal</h2>
              <p className="text-neutral-600">Choose where you'd like to start</p>
            </div>

            <div className="grid gap-4">
              <Card
                className="p-6 border border-neutral-200 bg-white shadow-none hover:border-neutral-300 cursor-pointer transition-all"
                onClick={() => handleGoalSelection('list-waste')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Database className="h-6 w-6 text-neutral-900" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-lg text-neutral-900">List My First Waste Material</div>
                    <div className="text-sm text-neutral-600">
                      Start monetizing your waste streams in the Circular Marketplace
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
              </Card>

              <Card
                className="p-6 border border-neutral-200 bg-white shadow-none hover:border-neutral-300 cursor-pointer transition-all"
                onClick={() => handleGoalSelection('calculate')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-neutral-900" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-lg text-neutral-900">Calculate My Carbon Footprint</div>
                    <div className="text-sm text-neutral-600">
                      Get detailed Scope 1, 2, and 3 emissions breakdown
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
              </Card>

              <Card
                className="p-6 border border-neutral-200 bg-white shadow-none hover:border-neutral-300 cursor-pointer transition-all"
                onClick={() => handleGoalSelection('compliance')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-neutral-900" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-lg text-neutral-900">Start Compliance Reporting</div>
                    <div className="text-sm text-neutral-600">
                      Begin CSRD, CDP, or other framework reporting
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
              </Card>

              <Button
                variant="outline"
                onClick={() => handleGoalSelection('dashboard')}
                className="w-full border-neutral-300 text-neutral-900 hover:bg-neutral-50"
              >
                I'll Explore on My Own
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
