import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon: ReactNode;
  chart?: ReactNode;
}

export const MetricCard = ({ title, value, trend, trendLabel, icon, chart }: MetricCardProps) => {
  const isPositiveTrend = trend ? trend > 0 : null;

  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
            <h3 className="text-2xl font-semibold text-foreground">{value}</h3>
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs mt-3 pt-3 border-t border-border">
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-success" />
            )}
            <span className={isPositiveTrend ? "text-success font-medium" : "text-success font-medium"}>
              {Math.abs(trend)}%
            </span>
            {trendLabel && <span className="text-muted-foreground">{trendLabel}</span>}
          </div>
        )}

        {chart && <div className="mt-4">{chart}</div>}
      </CardContent>
    </Card>
  );
};
