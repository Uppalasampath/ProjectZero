import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Carbon from "./pages/Carbon";
import Compliance from "./pages/Compliance";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import ListWaste from "./pages/ListWaste";
import MyTransactions from "./pages/MyTransactions";
import TransactionDetail from "./pages/TransactionDetail";
import EmissionSources from "./pages/EmissionSources";
import OffsetMarketplace from "./pages/OffsetMarketplace";
import OffsetProjectDetail from "./pages/OffsetProjectDetail";
import FrameworkDetail from "./pages/FrameworkDetail";
import DataCollection from "./pages/DataCollection";
import ReportGeneration from "./pages/ReportGeneration";
import RegulatoryMonitor from "./pages/RegulatoryMonitor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/list-waste" element={<ListWaste />} />
          <Route path="/my-transactions" element={<MyTransactions />} />
          <Route path="/transaction/:id" element={<TransactionDetail />} />
          <Route path="/carbon" element={<Carbon />} />
          <Route path="/emission-sources" element={<EmissionSources />} />
          <Route path="/offset-marketplace" element={<OffsetMarketplace />} />
          <Route path="/offset-project/:id" element={<OffsetProjectDetail />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/framework/:id" element={<FrameworkDetail />} />
          <Route path="/data-collection" element={<DataCollection />} />
          <Route path="/report-generation" element={<ReportGeneration />} />
          <Route path="/regulatory-monitor" element={<RegulatoryMonitor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
