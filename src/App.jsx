import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// pages
import HomePage          from './pages/HomePage';
import AuthPage          from './pages/AuthPage';
import FestDetailPage    from './pages/FestDetailPage';
import PaymentPage       from './pages/PaymentPage';
import StudentDashboard  from './pages/StudentDashboard';
import CollegeDashboard  from './pages/CollegeDashboard';
import { CollegeFestsPage, CreateFestPage } from './pages/CollegeFests';
import { CollegeEventsPage, ParticipantsPage } from './pages/CollegeEvents';
import CertificatePage   from './pages/CertificatePage';
import { AdminPage, CollegeSetupPage, CertVerifyPage } from './pages/AdminPages';

// ── route guards ──────────────────────────────────────────────────────────────
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

// ── app ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* public */}
          <Route path="/"                        element={<HomePage />} />
          <Route path="/login"                   element={<AuthPage mode="login" />} />
          <Route path="/signup"                  element={<AuthPage mode="signup" />} />
          <Route path="/fest/:festId"            element={<FestDetailPage />} />
          <Route path="/verify/:certificateId"   element={<CertVerifyPage />} />

          {/* student */}
          <Route path="/dashboard" element={
            <RequireAuth role="STUDENT"><StudentDashboard /></RequireAuth>
          } />
          <Route path="/pay/:registrationId" element={
            <RequireAuth role="STUDENT"><PaymentPage /></RequireAuth>
          } />

          {/* college */}
          <Route path="/college/setup" element={
            <RequireAuth role="COLLEGE"><CollegeSetupPage /></RequireAuth>
          } />
          <Route path="/college/dashboard" element={
            <RequireAuth role="COLLEGE"><CollegeDashboard /></RequireAuth>
          } />
          <Route path="/college/fests" element={
            <RequireAuth role="COLLEGE"><CollegeFestsPage /></RequireAuth>
          } />
          <Route path="/college/create-fest" element={
            <RequireAuth role="COLLEGE"><CreateFestPage /></RequireAuth>
          } />
          <Route path="/college/fest/:festId/events" element={
            <RequireAuth role="COLLEGE"><CollegeEventsPage /></RequireAuth>
          } />
          <Route path="/college/fest/:festId/participants" element={
            <RequireAuth role="COLLEGE"><ParticipantsPage /></RequireAuth>
          } />
          <Route path="/college/fest/:festId/certificate" element={
            <RequireAuth role="COLLEGE"><CertificatePage /></RequireAuth>
          } />

          {/* admin */}
          <Route path="/admin" element={
            <RequireAuth role="ADMIN"><AdminPage /></RequireAuth>
          } />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
