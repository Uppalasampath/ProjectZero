import { ArrowRight, FileText, Globe, Scale, Building2, BarChart3, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { complianceTypes } from "@/data/complianceTypes";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sb253: Scale,
  sb261: BarChart3,
  csrd: Building2,
  cdp: Globe,
  tcfd: FileText,
  issb: BookOpen,
};

const ComplianceSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6 tracking-tight">
            Compliance Types
            <br />
            <span className="font-normal">We Support</span>
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            Project Zero helps your organization stay compliant with major sustainability regulations.
            Learn about the types of compliance reporting we cover, from carbon accounting to climate risk disclosures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complianceTypes.map((compliance) => {
            const IconComponent = iconMap[compliance.id] || FileText;
            
            return (
              <div
                key={compliance.id}
                className="group bg-neutral-50 border border-neutral-200 rounded-2xl p-6 hover:border-neutral-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/compliance/${compliance.id}`)}
              >
                <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-5 group-hover:border-neutral-900 group-hover:bg-neutral-900 transition-all duration-300">
                  <IconComponent className="h-6 w-6 text-neutral-700 group-hover:text-white transition-colors duration-300" />
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-neutral-900">
                      {compliance.shortName}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600">
                      {compliance.jurisdiction}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                    {compliance.shortDescription}
                  </p>
                </div>

                <button
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/compliance/${compliance.id}`);
                  }}
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;
