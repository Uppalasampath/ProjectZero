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
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        
        {trend !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            {isPositiveTrend ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className={isPositiveTrend ? "text-success" : "text-destructive"}>
              {Math.abs(trend)}%
            </span>
            <span className="text-muted-foreground">{trendLabel}</span>
          </div>
        )}
        
        {chart && <div className="mt-4">{chart}</div>}
      </CardContent>
    </Card>
  );
};
