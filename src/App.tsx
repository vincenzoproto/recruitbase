import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
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
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Social = lazy(() => import("./pages/Social"));
const Feed = lazy(() => import("./pages/Feed"));
const SearchProfiles = lazy(() => import("./pages/SearchProfiles"));
const ScoreInfo = lazy(() => import("./pages/ScoreInfo"));
const Demo = lazy(() => import("./pages/Demo"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Messages = lazy(() => import("./pages/Messages"));
const Conversation = lazy(() => import("./pages/Conversation"));
const Groups = lazy(() => import("./pages/Groups"));
const Matches = lazy(() => import("./pages/Matches"));
const PremiumCandidate = lazy(() => import("./pages/PremiumCandidate"));
const Copilot = lazy(() => import("./pages/Copilot"));
const Offers = lazy(() => import("./pages/Offers"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const Language = lazy(() => import("./pages/Language"));
const Ambassador = lazy(() => import("./pages/Ambassador"));
const Badges = lazy(() => import("./pages/Badges"));
const Career = lazy(() => import("./pages/Career"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const SearchPeople = lazy(() => import("./pages/SearchPeople"));
const Connections = lazy(() => import("./pages/Connections"));
const ELearning = lazy(() => import("./pages/ELearning"));

const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <Skeleton className="h-full w-full" />
  </div>
);

const App = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/invite/:code" element={<Invite />} />
      <Route path="/invite" element={<InviteRef />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/social" element={<Social />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/search" element={<SearchProfiles />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/score-info" element={<ScoreInfo />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/messages/:userId" element={<Conversation />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/premium-candidate" element={<PremiumCandidate />} />
      <Route path="/copilot" element={<Copilot />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
      <Route path="/language" element={<Language />} />
      <Route path="/ambassador" element={<Ambassador />} />
      <Route path="/badges" element={<Badges />} />
      <Route path="/career" element={<Career />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/search-people" element={<SearchPeople />} />
      <Route path="/connections" element={<Connections />} />
      <Route path="/e-learning" element={<ELearning />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default App;
