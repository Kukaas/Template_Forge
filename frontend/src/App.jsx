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
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;