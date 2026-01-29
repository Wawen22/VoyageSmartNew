import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Trips from "./pages/Trips";
import CreateTrip from "./pages/CreateTrip";
import TripDetail from "./pages/TripDetail";
import PublicTripView from "./pages/PublicTripView";
import Expenses from "./pages/Expenses";
import Accommodations from "./pages/Accommodations";
import Transports from "./pages/Transports";
import Itinerary from "./pages/Itinerary";
import Checklist from "./pages/Checklist";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
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
            <Route path="/" element={<Index />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/new" element={<CreateTrip />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route path="/share/:token" element={<PublicTripView />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/accommodations" element={<Accommodations />} />
            <Route path="/transports" element={<Transports />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
