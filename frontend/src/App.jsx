import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminRoute from './components/AdminRoute.jsx';

const UiKit = lazy(() => import('./pages/UiKit.jsx'));
const About = lazy(() => import('./pages/public/About.jsx'));
const HowItWorks = lazy(() => import('./pages/public/HowItWorks.jsx'));
const Projects = lazy(() => import('./pages/public/Projects.jsx'));
const ProjectDetail = lazy(() => import('./pages/public/ProjectDetail.jsx'));
const Events = lazy(() => import('./pages/public/Events.jsx'));
const EventDetail = lazy(() => import('./pages/public/EventDetail.jsx'));
const Team = lazy(() => import('./pages/public/Team.jsx'));
const Contact = lazy(() => import('./pages/public/Contact.jsx'));
const Join = lazy(() => import('./pages/public/Join.jsx'));
const Login = lazy(() => import('./pages/auth/Login.jsx'));
const Register = lazy(() => import('./pages/auth/Register.jsx'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard.jsx'));
const MyRequests = lazy(() => import('./pages/dashboard/MyRequests.jsx'));
const Overview = lazy(() => import('./pages/admin/Overview.jsx'));
const AdminIdeas = lazy(() => import('./pages/admin/Ideas.jsx'));
const AdminProjects = lazy(() => import('./pages/admin/Projects.jsx'));
const AdminStudents = lazy(() => import('./pages/admin/Students.jsx'));
const AdminRequests = lazy(() => import('./pages/admin/Requests.jsx'));
const AdminEvents = lazy(() => import('./pages/admin/Events.jsx'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements.jsx'));
const AdminMessages = lazy(() => import('./pages/admin/Messages.jsx'));
const SubmitIdea = lazy(() => import('./pages/ideas/SubmitIdea.jsx'));
const MyIdeas = lazy(() => import('./pages/ideas/MyIdeas.jsx'));
const IdeaDetail = lazy(() => import('./pages/ideas/IdeaDetail.jsx'));
const ExploreIdeas = lazy(() => import('./pages/ideas/ExploreIdeas.jsx'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/join" element={<Join />} />
            <Route path="/ideas" element={<ExploreIdeas />} />
            <Route path="/ideas/:id" element={<IdeaDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ui-kit" element={<UiKit />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/requests/my" element={<MyRequests />} />
              <Route path="/ideas/submit" element={<SubmitIdea />} />
              <Route path="/ideas/edit/:id" element={<SubmitIdea />} />
              <Route path="/ideas/my" element={<MyIdeas />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Overview />} />
              <Route path="/admin/ideas" element={<AdminIdeas />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
            </Route>
          </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
