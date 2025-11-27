import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  metrics: { label: string; value: string }[];
  route: string;
}

export const ModuleCard = ({ title, description, icon, metrics, route }: ModuleCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border border-neutral-200 bg-white shadow-none hover:border-neutral-300 transition-colors group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-medium text-neutral-900">{title}</CardTitle>
              <p className="text-sm text-neutral-600 mt-0.5">{description}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">{metric.label}</span>
              <span className="font-medium text-neutral-900">{metric.value}</span>
            </div>
          ))}
        </div>
        <Button
          onClick={() => navigate(route)}
          variant="outline"
          className="w-full border-neutral-300 text-neutral-900 hover:bg-neutral-50 hover:border-neutral-400"
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
