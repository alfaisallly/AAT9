import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Books from './pages/Books';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Search from './pages/Search';
import LiaisonPortal from './pages/LiaisonPortal';
import Brands from './pages/Brands';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="login-page"><LoadingSpinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}

function AdminOnly({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div>جاري التحميل...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="search" element={<Search />} />
        <Route path="liaison" element={<LiaisonPortal />} />
        <Route path="devices" element={<Devices />} />
        <Route path="books" element={<Books />} />
        <Route path="reports" element={<Reports />} />
        <Route path="brands" element={<Brands />} />
        <Route path="users" element={<AdminOnly><Users /></AdminOnly>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
