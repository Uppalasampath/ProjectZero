import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Book, Video, Mail } from "lucide-react";

const Help = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground mt-1">Find answers and get assistance</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help articles..."
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Book className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Documentation</CardTitle>
              <CardDescription>Comprehensive guides and tutorials</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Video className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Video Tutorials</CardTitle>
              <CardDescription>Step-by-step video guides</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <MessageCircle className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Live Chat</CardTitle>
              <CardDescription>Chat with our support team</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I list waste materials on the marketplace?</AccordionTrigger>
                <AccordionContent>
                  Click the floating action button (+) in the bottom right corner and select "List New Waste Material". Fill in the material details, upload photos, and our AI will automatically find potential buyers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How are carbon emissions calculated?</AccordionTrigger>
                <AccordionContent>
                  The Carbon Engine automatically pulls data from your connected ERP systems and calculates emissions across Scope 1, 2, and 3 using industry-standard methodologies (GHG Protocol). You can view detailed breakdowns by source and category.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Which compliance frameworks are supported?</AccordionTrigger>
                <AccordionContent>
                  ZERO supports CSRD, SB 253, CDP, TCFD, ISSB, and other major frameworks. The Compliance Autopilot automatically maps your data to the required disclosure requirements and generates audit-ready reports.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I connect my ERP system?</AccordionTrigger>
                <AccordionContent>
                  Go to Settings → Integrations and click "Connect" next to your ERP system (SAP, Oracle, Workday, QuickBooks, etc.). Follow the authentication prompts to securely link your accounts. Data syncs automatically every 24 hours.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>How are carbon credits generated from marketplace transactions?</AccordionTrigger>
                <AccordionContent>
                  When you complete a circular transaction, ZERO automatically calculates the avoided emissions compared to virgin material production. These carbon reductions are verified and can be tokenized as carbon credits on the blockchain.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Still need help?</h3>
            <p className="mb-4 opacity-90">Contact our support team directly</p>
            <Button variant="outline" className="bg-white text-primary hover:bg-white/90">
              Email Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Help;
