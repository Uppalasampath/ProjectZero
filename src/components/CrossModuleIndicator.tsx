import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ExternalLink, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CrossModuleIndicatorProps {
  sourceArea: "Marketplace" | "Carbon" | "Compliance";
  targetArea: "Marketplace" | "Carbon" | "Compliance";
  lastSync?: string;
  dataPoints?: string[];
  linkUrl?: string;
  showRealTimeIndicator?: boolean;
}

export function CrossModuleIndicator({
  sourceArea,
  targetArea,
  lastSync,
  dataPoints,
  linkUrl,
  showRealTimeIndicator = false
}: CrossModuleIndicatorProps) {
  const navigate = useNavigate();

  const getAreaColor = (area: string) => {
    switch (area) {
      case "Marketplace": return "bg-primary/10 text-primary border-primary/30";
      case "Carbon": return "bg-success/10 text-success border-success/30";
      case "Compliance": return "bg-accent/10 text-accent border-accent/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAreaName = (area: string) => {
    switch (area) {
      case "Marketplace": return "Circular Marketplace";
      case "Carbon": return "Carbon Engine";
      case "Compliance": return "Compliance Autopilot";
      default: return area;
    }
  };

  return (
    <div className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Platform Integration</span>
        </div>
        {showRealTimeIndicator && (
          <Badge variant="outline" className="text-xs border-success/30">
            <span className="w-2 h-2 rounded-full bg-success mr-1 animate-pulse" />
            Real-time sync
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Badge variant="outline" className={getAreaColor(sourceArea)}>
          {sourceArea}
        </Badge>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className={getAreaColor(targetArea)}>
          {targetArea}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Data automatically synced from {getAreaName(sourceArea)}
      </p>

      {dataPoints && dataPoints.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Auto-filled: {dataPoints.join(', ')}
        </div>
      )}

      {lastSync && (
        <div className="text-xs text-muted-foreground">
          Last synced: {new Date(lastSync).toLocaleString()}
        </div>
      )}

      {linkUrl && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate(linkUrl)}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View in {getAreaName(sourceArea)}
        </Button>
      )}
    </div>
  );
}
