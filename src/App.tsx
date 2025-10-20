import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/list-waste" element={<ProtectedRoute><ListWaste /></ProtectedRoute>} />
            <Route path="/my-transactions" element={<ProtectedRoute><MyTransactions /></ProtectedRoute>} />
            <Route path="/transaction/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
            <Route path="/carbon" element={<ProtectedRoute><Carbon /></ProtectedRoute>} />
            <Route path="/emission-sources" element={<ProtectedRoute><EmissionSources /></ProtectedRoute>} />
            <Route path="/offset-marketplace" element={<ProtectedRoute><OffsetMarketplace /></ProtectedRoute>} />
            <Route path="/offset-project/:id" element={<ProtectedRoute><OffsetProjectDetail /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
            <Route path="/framework/:id" element={<ProtectedRoute><FrameworkDetail /></ProtectedRoute>} />
            <Route path="/data-collection" element={<ProtectedRoute><DataCollection /></ProtectedRoute>} />
            <Route path="/report-generation" element={<ProtectedRoute><ReportGeneration /></ProtectedRoute>} />
            <Route path="/regulatory-monitor" element={<ProtectedRoute><RegulatoryMonitor /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
