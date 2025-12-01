import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Calendar, Users, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getComplianceById, complianceTypes } from "@/data/complianceTypes";
import zeroLogo from "@/assets/zero-logo.png";

const ComplianceLearnMore = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const compliance = id ? getComplianceById(id) : undefined;

  if (!compliance) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-neutral-900 mb-4">Compliance type not found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <Link to="/" className="flex items-center gap-2">
            <img src={zeroLogo} alt="ZERO" className="h-8 w-8 object-contain" />
            <span className="text-xl font-semibold text-neutral-900 tracking-tight">ZERO</span>
          </Link>
          <Button
            variant="ghost"
            className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            onClick={() => navigate("/login")}
          >
            Join Beta
          </Button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="border-b border-neutral-100 bg-neutral-50">
        <div className="container mx-auto px-6 py-3 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-neutral-500 hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-500">Compliance Types</span>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-900 font-medium">{compliance.shortName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-20 border-b border-neutral-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <Button
            variant="ghost"
            className="mb-8 text-neutral-600 hover:text-neutral-900 -ml-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 mb-6">
              <span className="text-sm text-neutral-600">{compliance.jurisdiction}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-light text-neutral-900 mb-4 tracking-tight leading-tight">
              {compliance.shortName}
            </h1>
            <p className="text-xl text-neutral-500 mb-6">{compliance.name}</p>
            <p className="text-lg text-neutral-600 leading-relaxed max-w-3xl">
              {compliance.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div>
                <h2 className="text-2xl font-medium text-neutral-900 mb-4">Overview</h2>
                <p className="text-neutral-600 leading-relaxed">{compliance.overview}</p>
              </div>

              {/* Who Must Comply */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-neutral-700" />
                  </div>
                  <h2 className="text-2xl font-medium text-neutral-900">Who Must Comply</h2>
                </div>
                <ul className="space-y-3">
                  {compliance.whoMustComply.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-neutral-400 mt-2.5 flex-shrink-0" />
                      <span className="text-neutral-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reporting Scope */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-neutral-700" />
                  </div>
                  <h2 className="text-2xl font-medium text-neutral-900">{compliance.reportingScope.title}</h2>
                </div>
                <ul className="space-y-3">
                  {compliance.reportingScope.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-neutral-400 mt-2.5 flex-shrink-0" />
                      <span className="text-neutral-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scope Breakdown (if available) */}
              {compliance.scopeBreakdown && (
                <div>
                  <h2 className="text-2xl font-medium text-neutral-900 mb-6">GHG Emissions Scopes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                      <div className="text-sm font-medium text-neutral-500 mb-2">Scope 1</div>
                      <p className="text-sm text-neutral-600">{compliance.scopeBreakdown.scope1}</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                      <div className="text-sm font-medium text-neutral-500 mb-2">Scope 2</div>
                      <p className="text-sm text-neutral-600">{compliance.scopeBreakdown.scope2}</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                      <div className="text-sm font-medium text-neutral-500 mb-2">Scope 3</div>
                      <p className="text-sm text-neutral-600">{compliance.scopeBreakdown.scope3}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Deadlines */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-neutral-700" />
                  </div>
                  <h2 className="text-2xl font-medium text-neutral-900">Key Deadlines</h2>
                </div>
                <p className="text-neutral-600 mb-4">
                  <span className="font-medium">Reporting Frequency:</span> {compliance.frequency}
                </p>
                <div className="space-y-3">
                  {compliance.keyDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl"
                    >
                      <div className="px-3 py-1 bg-neutral-900 text-white text-sm font-medium rounded-md whitespace-nowrap">
                        {deadline.date}
                      </div>
                      <p className="text-neutral-600">{deadline.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Official Resources */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Official Resources</h3>
                  <div className="space-y-3">
                    {compliance.officialResources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors group"
                      >
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        <span className="group-hover:underline">{resource.name}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* CTA Card */}
                <div className="bg-neutral-900 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-medium mb-3">Ready to get compliant?</h3>
                  <p className="text-sm text-neutral-400 mb-6">
                    Project Zero automates {compliance.shortName} reporting with real-time data tracking and audit-ready documentation.
                  </p>
                  <Button
                    className="w-full bg-white text-neutral-900 hover:bg-neutral-100"
                    onClick={() => navigate("/login")}
                  >
                    Get Started
                  </Button>
                </div>

                {/* Other Frameworks */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Other Frameworks</h3>
                  <div className="space-y-2">
                    {complianceTypes
                      .filter((c) => c.id !== compliance.id)
                      .slice(0, 4)
                      .map((c) => (
                        <Link
                          key={c.id}
                          to={`/compliance/${c.id}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-100 transition-colors group"
                        >
                          <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                            {c.shortName}
                          </span>
                          <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" />
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-12 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={zeroLogo} alt="ZERO" className="h-6 w-6 object-contain" />
              <span className="text-sm font-medium text-neutral-900">ZERO</span>
            </Link>
            <p className="text-sm text-neutral-500">© 2024 ZERO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComplianceLearnMore;
