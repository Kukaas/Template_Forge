import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import RootLayout from './layouts/RootLayout';
import { AuthProvider } from './lib/auth';
import Templates from './pages/Templates';
import PrivateTemplates from './pages/PrivateTemplates';
import AcademicTemplates from './pages/AcademicTemplates';
import ResumeTemplates from './pages/ResumeTemplates';
import BusinessTemplates from './pages/BusinessTemplates';
import SuperAdmin from './pages/admin/SuperAdmin';
import ManageTemplates from './pages/admin/ManageTemplates';
import Pricing from './pages/Pricing';
import SavedTemplates from './pages/SavedTemplates';
import Editor from './pages/Editor';
import CopiedTemplates from './pages/CopiedTemplates';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="templates" element={<Templates />} />

              {/* Private Routes */}
              <Route
                path="dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="templates/premium"
                element={
                  <PrivateRoute>
                    <PrivateTemplates />
                  </PrivateRoute>
                }
              />
              <Route
                path="templates/academic"
                element={
                  <PrivateRoute>
                    <AcademicTemplates />
                  </PrivateRoute>
                }
              />
              <Route
                path="templates/resume"
                element={
                  <PrivateRoute>
                    <ResumeTemplates />
                  </PrivateRoute>
                }
              />
              <Route
                path="templates/business"
                element={
                  <PrivateRoute>
                    <BusinessTemplates />
                  </PrivateRoute>
                }
              />

              {/* Super Admin Routes */}
              <Route
                path="admin"
                element={
                  <PrivateRoute>
                    <SuperAdmin />
                  </PrivateRoute>
                }
              />
              <Route
                path="admin/templates"
                element={
                  <PrivateRoute>
                    <ManageTemplates />
                  </PrivateRoute>
                }
              />

              {/* Add Pricing Route */}
              <Route path="pricing" element={<Pricing />} />

              {/* Add Saved Templates Route */}
              <Route
                path="templates/saved"
                element={
                  <PrivateRoute>
                    <SavedTemplates />
                  </PrivateRoute>
                }
              />

              {/* Add Editor Route */}
              <Route
                path="/editor/:templateId"
                element={
                  <PrivateRoute>
                    <Editor />
                  </PrivateRoute>
                }
              />

              {/* Add Copied Templates Route */}
              <Route
                path="/copied-templates"
                element={
                  <PrivateRoute>
                    <CopiedTemplates />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;