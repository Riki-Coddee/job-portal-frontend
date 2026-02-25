// App.js
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'

import RecruiterLayout from './components/Layout/RecruiterLayout'
import PostJob from './pages/Recruiter/PostJob'
import Candidates from './pages/Recruiter/Candidates'
import CandidateDetail from './pages/Recruiter/CandidateDetail'
import RecruiterDashboard from './pages/Recruiter/RecruiterDashboard'
import ManageJobs from './pages/Recruiter/ManageJobs'
import Messages from './pages/Recruiter/Messages'
import Analytics from './pages/Recruiter/Analytics'
import CompanyProfile from './pages/Recruiter/CompanyProfile'
import Settings from './pages/Recruiter/Settings'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import About from './pages/About'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Profile from './pages/Profile'
import Applications from './pages/Applications'
import Interviews from './pages/Interviews'
import JobSeekerMessages from './pages/JobSeekerMessages'
import MyApplications from './pages/MyApplications'
import JobSeekerProtectedRoute from './components/JobSeekerProtectedRoute'
import RecruiterProtectedRoute from './components/RecruiterProtectedRoute.jsx'
import RecruiterProfile from './pages/Recruiter/RecruiterProfile.jsx'
import RecruiterProfileView from './pages/RecruiterProfileView.jsx'
import Notifications from './pages/Notifications.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  const { isAuthorized, user, loading, initialized } = useAuth()
  
  // Layout component for public routes with Header and Footer
    const PublicLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );

  // Layout for job seeker protected routes
  const JobSeekerLayout = ({ children }) => (
    <JobSeekerProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </JobSeekerProtectedRoute>
  );

  return (
    <Routes>
      {/* Public Routes - Accessible to all */}
      <Route path="/" element={
        <PublicLayout>
          <Home />
        </PublicLayout>
      } />
      
      <Route path="/about" element={
        <PublicLayout>
          <About />
        </PublicLayout>
      } />

      <Route path="/contact" element={
        <PublicLayout>
          <Contact />
        </PublicLayout>
      } />
      
      <Route path="/jobs" element={
        <PublicLayout>
          <Jobs />
        </PublicLayout>
      } />
      
      <Route path="/jobs/:id" element={
        <PublicLayout>
          <JobDetails />
        </PublicLayout>
      } />
      
      <Route path="/login" element={
        <PublicLayout>
          <Login />
        </PublicLayout>
      } />
      
      <Route path="/register" element={
        <PublicLayout>
          <Register />
        </PublicLayout>
      } />
      
      {/* Job Seeker Only Routes */}
      <Route path="/my-applications" element={
        <JobSeekerLayout>
          <MyApplications />
        </JobSeekerLayout>
      } />
      
      <Route path="/profile" element={
        <JobSeekerLayout>
          <Profile />
        </JobSeekerLayout>
      } />
      
      <Route path="/applications" element={
        <JobSeekerLayout>
          <Applications />
        </JobSeekerLayout>
      } />
      
      <Route path="/interviews" element={
        <JobSeekerLayout>
          <Interviews />
        </JobSeekerLayout>
      } />
      
      <Route path="/messages" element={
        <JobSeekerLayout>
          <JobSeekerMessages />
        </JobSeekerLayout>
      } />
      <Route path="/recruiter/:recruiterId" element={
         <JobSeekerLayout>
            <RecruiterProfileView />
         </JobSeekerLayout>
        } />
      <Route path="/company/:companyId" element={
        <JobSeekerLayout>
          <RecruiterProfileView />
        </JobSeekerLayout>
        } />
        <Route path="/notifications" element={
        <JobSeekerLayout>
          <Notifications />
        </JobSeekerLayout>
        } />
      
      {/* Recruiter Only Routes */}
      <Route path="/recruiter" element={
        <RecruiterProtectedRoute>
          <RecruiterLayout />
        </RecruiterProtectedRoute>
      }>
        <Route index element={<RecruiterDashboard />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="candidates/:id" element={<CandidateDetail />} />
        <Route path="messages" element={<Messages />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="/recruiter/profile" element={<RecruiterProfile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={
        <PublicLayout>
          <NotFound />
        </PublicLayout>
      } />
    </Routes>
  )
}

export default App