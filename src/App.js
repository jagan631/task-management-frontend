import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import ProjectForm from './components/projects/ProjectForm';
import ProjectDetail from './components/projects/ProjectDetail';
import TaskList from './components/tasks/TaskList';
import TaskForm from './components/tasks/TaskForm';
import TaskDetail from './components/tasks/TaskDetail';
import ProtectedRoute from './components/ProtectedRoute';

// Layout wrapper component
function AppLayout({ children }) {
  const { user } = useAuth();
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Task Management</h1>
                            <div className="flex space-x-4">
                <button
                  onClick={() => window.location.href='/dashboard'}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    window.location.pathname === '/dashboard'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => window.location.href='/projects'}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    window.location.pathname.startsWith('/projects')
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => window.location.href='/tasks'}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    window.location.pathname.startsWith('/tasks')
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Tasks
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Project Routes */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Task Routes */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TaskList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TaskForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TaskDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TaskForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;