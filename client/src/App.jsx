import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import VideoManagement from './pages/admin/VideoManagement';
import QuestionEditor from './pages/admin/QuestionEditor';
import Reports from './pages/admin/Reports';
import LearnerDashboard from './pages/learner/LearnerDashboard';
import VideoWatch from './pages/learner/VideoWatch';
import MyProgress from './pages/learner/MyProgress';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/videos"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <VideoManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/videos/:videoId/questions"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <QuestionEditor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/learner"
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <LearnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/learner/videos/:videoId"
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <VideoWatch />
              </ProtectedRoute>
            }
          />

          <Route
            path="/learner/progress"
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <MyProgress />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
