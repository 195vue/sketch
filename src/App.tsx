import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Drawings } from './pages/Drawings';
import { SketchPreview } from './pages/SketchPreview';
import { DwgPreview } from './pages/DwgPreview';
import { Tasks } from './pages/Tasks';
import { Settings } from './pages/Settings';
import { Tenants } from './pages/Tenants';
import { Logs } from './pages/Logs';
import { Members } from './pages/Members';
import { CompanyUsers } from './pages/CompanyUsers';
import { Dictionary } from './pages/Dictionary';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { useStore } from './store/useStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useStore();
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, user } = useStore();
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  if (user?.role !== 'super_admin') {
    return <Navigate to="/projects" />;
  }
  return <>{children}</>;
};

const TenantRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, user } = useStore();
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  if (user?.role !== 'super_admin' && user?.role !== 'tenant_admin') {
    return <Navigate to="/projects" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/projects" />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/drawings" element={<Drawings />} />
        <Route path="projects/:id/members" element={<Members />} />
        <Route
          path="projects/:id/drawings/:fileId/preview"
          element={<SketchPreview />}
        />
        <Route
          path="projects/:id/drawings/:fileId/dwg-preview"
          element={<DwgPreview />}
        />
        <Route path="system/users" element={<TenantRoute><CompanyUsers /></TenantRoute>} />
        <Route path="system/tenants" element={<AdminRoute><Tenants /></AdminRoute>} />
        <Route path="system/tasks" element={<TenantRoute><Tasks /></TenantRoute>} />
        <Route path="system/logs" element={<TenantRoute><Logs /></TenantRoute>} />
        <Route path="system/dictionary" element={<AdminRoute><Dictionary /></AdminRoute>} />
        <Route path="system/settings" element={<AdminRoute><Settings /></AdminRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
