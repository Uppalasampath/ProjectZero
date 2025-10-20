import { Plus, Recycle, Leaf, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export const QuickActionsButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-elegant bg-gradient-primary hover:scale-110 transition-transform"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card">
          <DropdownMenuItem onClick={() => navigate("/list-waste")} className="cursor-pointer">
            <Recycle className="mr-2 h-4 w-4" />
            List New Waste Material
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/carbon")} className="cursor-pointer">
            <Leaf className="mr-2 h-4 w-4" />
            Calculate Emissions
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/report-generation")} className="cursor-pointer">
            <FileCheck className="mr-2 h-4 w-4" />
            Generate Compliance Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
