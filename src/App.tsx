import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Carbon from "./pages/Carbon";
import Compliance from "./pages/Compliance";
import Organization from "./pages/Organization";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import ListWaste from "./pages/ListWaste";
import MaterialDetail from "./pages/MaterialDetail";
import MyMaterials from "./pages/MyMaterials";
import MyTransactions from "./pages/MyTransactions";
import MarketplaceAnalytics from "./pages/MarketplaceAnalytics";
import TransactionDetail from "./pages/TransactionDetail";
import VerifyTransaction from "./pages/VerifyTransaction";
import EmissionSources from "./pages/EmissionSources";
import CarbonDashboard from "./pages/CarbonDashboard";
import EmissionSourcesManagement from "./pages/EmissionSourcesManagement";
import BaselineCalculator from "./pages/BaselineCalculator";
import SupplierPortal from "./pages/SupplierPortal";
import CarbonRecommendations from "./pages/CarbonRecommendations";
import OffsetMarketplace from "./pages/OffsetMarketplace";
import OffsetProjectDetail from "./pages/OffsetProjectDetail";
import FrameworkDetail from "./pages/FrameworkDetail";
import DataCollection from "./pages/DataCollection";
import ReportGeneration from "./pages/ReportGeneration";
import RegulatoryMonitor from "./pages/RegulatoryMonitor";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/blog" element={<Blog />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/marketplace/:id" element={<ProtectedRoute><MaterialDetail /></ProtectedRoute>} />
          <Route path="/list-waste" element={<ProtectedRoute><ListWaste /></ProtectedRoute>} />
          <Route path="/my-materials" element={<ProtectedRoute><MyMaterials /></ProtectedRoute>} />
          <Route path="/my-transactions" element={<ProtectedRoute><MyTransactions /></ProtectedRoute>} />
          <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
          <Route path="/marketplace-analytics" element={<ProtectedRoute><MarketplaceAnalytics /></ProtectedRoute>} />
            <Route path="/transaction/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
            <Route path="/carbon" element={<ProtectedRoute><Carbon /></ProtectedRoute>} />
            <Route path="/carbon/dashboard" element={<ProtectedRoute><CarbonDashboard /></ProtectedRoute>} />
            <Route path="/carbon/sources" element={<ProtectedRoute><EmissionSourcesManagement /></ProtectedRoute>} />
            <Route path="/carbon/baseline-calculator" element={<ProtectedRoute><BaselineCalculator /></ProtectedRoute>} />
            <Route path="/carbon/verify-transaction/:id" element={<ProtectedRoute><VerifyTransaction /></ProtectedRoute>} />
            <Route path="/carbon/suppliers" element={<ProtectedRoute><SupplierPortal /></ProtectedRoute>} />
            <Route path="/carbon/recommendations" element={<ProtectedRoute><CarbonRecommendations /></ProtectedRoute>} />
            <Route path="/emission-sources" element={<ProtectedRoute><EmissionSources /></ProtectedRoute>} />
            <Route path="/offset-marketplace" element={<ProtectedRoute><OffsetMarketplace /></ProtectedRoute>} />
            <Route path="/offset-project/:id" element={<ProtectedRoute><OffsetProjectDetail /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
            <Route path="/framework/:id" element={<ProtectedRoute><FrameworkDetail /></ProtectedRoute>} />
            <Route path="/data-collection" element={<ProtectedRoute><DataCollection /></ProtectedRoute>} />
            <Route path="/report-generation" element={<ProtectedRoute><ReportGeneration /></ProtectedRoute>} />
            <Route path="/regulatory-monitor" element={<ProtectedRoute><RegulatoryMonitor /></ProtectedRoute>} />
            <Route path="/organization" element={<ProtectedRoute><Organization /></ProtectedRoute>} />
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
