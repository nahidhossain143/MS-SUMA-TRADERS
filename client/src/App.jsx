// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="/orders"    element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/admin"     element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
