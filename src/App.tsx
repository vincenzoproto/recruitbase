import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Skeleton } from "@/components/ui/skeleton";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Invite = lazy(() => import("./pages/Invite"));
const InviteRef = lazy(() => import("./pages/InviteRef"));
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const Social = lazy(() => import("./pages/Social"));
const SearchProfiles = lazy(() => import("./pages/SearchProfiles"));
const ScoreInfo = lazy(() => import("./pages/ScoreInfo"));
const Demo = lazy(() => import("./pages/Demo"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Messages = lazy(() => import("./pages/Messages"));
const Copilot = lazy(() => import("./pages/Copilot"));
const Offers = lazy(() => import("./pages/Offers"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <Skeleton className="h-full w-full" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="recruit-base-theme">
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invite/:code" element={<Invite />} />
            <Route path="/invite" element={<InviteRef />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/social" element={<Social />} />
            <Route path="/search" element={<SearchProfiles />} />
            <Route path="/score-info" element={<ScoreInfo />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/copilot" element={<Copilot />} />
            <Route path="/offers" element={<Offers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
