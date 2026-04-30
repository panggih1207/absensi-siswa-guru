import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useUIStore from './store/uiStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Trainings from './pages/Trainings';
import Courses from './pages/Courses';
import Tests from './pages/Tests';
import Questions from './pages/Questions';
import Results from './pages/Results';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Placeholder from './pages/Placeholder';
import NotFound from './pages/NotFound';
import { ToastContainer } from './components/ui/toast';

// Protected Route
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

// Public Route (redirect if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { language } = useUIStore();

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trainings" element={<ProtectedRoute><Trainings /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
        <Route path="/questions" element={<ProtectedRoute roles={['admin', 'teacher']}><Questions /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={['admin', 'teacher']}><Users /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

        {/* Placeholder pages */}
        <Route path="/calendar" element={<ProtectedRoute><Placeholder title="Calendar" /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Placeholder title="Chat" /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute><Placeholder title="Performance" /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Placeholder title="Reports" /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Placeholder title="Notes" /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
