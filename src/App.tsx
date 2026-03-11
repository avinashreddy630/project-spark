import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import NotFound from "./pages/NotFound";

const Splash = lazy(() => import("./pages/Splash"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chat = lazy(() => import("./pages/Chat"));
const Quiz = lazy(() => import("./pages/Quiz"));
const StudyProgress = lazy(() => import("./pages/StudyProgress"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex h-[60dvh] items-center justify-center">
      <LoadingSpinner size="lg" label="Loading..." />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Standalone screens (no nav) */}
            <Route path="/splash" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Main app with layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/progress" element={<StudyProgress />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
