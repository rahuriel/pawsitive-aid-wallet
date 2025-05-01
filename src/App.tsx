
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TreatmentRequests from "./pages/TreatmentRequests";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import VetDashboard from "./pages/VetDashboard";
import VetProfile from "./pages/VetProfile";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import ActivityList from "./pages/ActivityList";
import TreatmentsList from "./pages/TreatmentsList";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/treatment-requests" element={<TreatmentRequests />} />
            <Route path="/vet-dashboard" element={<VetDashboard />} />
            <Route path="/vet-profile" element={<VetProfile />} />
            <Route path="/moderator" element={<ModeratorDashboard />} />
            <Route path="/activities" element={<ActivityList />} />
            <Route path="/treatments" element={<TreatmentsList />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
