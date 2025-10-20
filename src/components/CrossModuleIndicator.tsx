import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ExternalLink, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CrossModuleIndicatorProps {
  sourceModule: "Module 1" | "Module 2" | "Module 3";
  targetModule: "Module 1" | "Module 2" | "Module 3";
  lastSync?: string;
  dataPoints?: string[];
  linkUrl?: string;
  showRealTimeIndicator?: boolean;
}

export function CrossModuleIndicator({
  sourceModule,
  targetModule,
  lastSync,
  dataPoints,
  linkUrl,
  showRealTimeIndicator = false
}: CrossModuleIndicatorProps) {
  const navigate = useNavigate();

  const getModuleColor = (module: string) => {
    switch (module) {
      case "Module 1": return "bg-blue-500";
      case "Module 2": return "bg-green-500";
      case "Module 3": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getModuleName = (module: string) => {
    switch (module) {
      case "Module 1": return "Circular Marketplace";
      case "Module 2": return "Carbon Engine";
      case "Module 3": return "Compliance Autopilot";
      default: return module;
    }
  };

  return (
    <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Cross-Module Integration</span>
        </div>
        {showRealTimeIndicator && (
          <Badge variant="outline" className="text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />
            Real-time sync
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Badge className={`${getModuleColor(sourceModule)} text-white`}>
          {sourceModule}
        </Badge>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <Badge className={`${getModuleColor(targetModule)} text-white`}>
          {targetModule}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Data automatically synced from {getModuleName(sourceModule)}
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
          View in {getModuleName(sourceModule)}
        </Button>
      )}
    </div>
  );
}
