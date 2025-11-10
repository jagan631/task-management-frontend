import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI } from '../../utils/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    reviewTasks: 0,
    doneTasks: 0,
    highPriorityTasks: 0,
    myTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes] = await Promise.all([
        projectAPI.getAll(),
        taskAPI.getAll(),
      ]);

      const projects = projectsRes.data;
      const tasks = tasksRes.data;

      // Calculate statistics
      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalTasks: tasks.length,
        todoTasks: tasks.filter(t => t.status === 'todo').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        reviewTasks: tasks.filter(t => t.status === 'review').length,
        doneTasks: tasks.filter(t => t.status === 'done').length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
        myTasks: tasks.filter(t => t.assignedTo?._id === user._id).length,
      });

      // Get recent tasks (last 5)
      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-gray-900">Task Management</h1>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Task Management</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Projects
                </button>
                <button
                  onClick={() => navigate('/tasks')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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
          {/* Welcome Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your projects and tasks today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Projects Stats */}
            <div 
              className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/projects')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalProjects}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.activeProjects} active
              </p>
            </div>

            {/* Total Tasks */}
            <div 
              className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/tasks')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalTasks}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.doneTasks} completed
              </p>
            </div>

            {/* My Tasks */}
            <div 
              className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/tasks')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Tasks</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.myTasks}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Assigned to you
              </p>
            </div>

            {/* High Priority */}
            <div 
              className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/tasks')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-3xl font-bold text-red-600">{stats.highPriorityTasks}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Needs attention
              </p>
            </div>
          </div>

          {/* Task Status Breakdown */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.todoTasks}</p>
                <p className="text-sm text-yellow-700 mt-1">To Do</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</p>
                <p className="text-sm text-blue-700 mt-1">In Progress</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.reviewTasks}</p>
                <p className="text-sm text-purple-700 mt-1">Review</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{stats.doneTasks}</p>
                <p className="text-sm text-green-700 mt-1">Done</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalTasks > 0 ? (stats.doneTasks / stats.totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
              <button
                onClick={() => navigate('/tasks')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </button>
            </div>

            {recentTasks.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No tasks yet. Create your first task!</p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.project?.title} • {task.assignedTo?.name || 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Info Card */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-24">Name:</span>
                <span className="text-sm text-gray-900">{user?.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-24">Email:</span>
                <span className="text-sm text-gray-900">{user?.email}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-24">Role:</span>
                <span className="text-sm text-gray-900 capitalize">{user?.role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;