import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskAPI, projectAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: '',
    priority: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await taskAPI.getById(id);
      setTask(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description || '',
        assignedTo: response.data.assignedTo?._id || '',
        status: response.data.status,
        priority: response.data.priority,
        dueDate: response.data.dueDate ? response.data.dueDate.split('T')[0] : '',
      });
      
      if (response.data.project) {
        fetchProjectMembers(response.data.project._id);
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      const response = await projectAPI.getById(projectId);
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await taskAPI.update(id, formData);
      setTask(response.data);
      setEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.delete(id);
        navigate('/tasks');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Task not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/tasks')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
        </div>
        <div className="flex space-x-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} {member._id === user._id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    title: task.title,
                    description: task.description || '',
                    assignedTo: task.assignedTo?._id || '',
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                  });
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority} priority
              </span>
            </div>

            <p className="text-gray-700 whitespace-pre-wrap">
              {task.description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Project</h4>
              <p
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => navigate(`/projects/${task.project._id}`)}
              >
                {task.project?.title || 'No project'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h4>
              <p className="text-gray-900">
                {task.assignedTo ? `${task.assignedTo.name} (${task.assignedTo.email})` : 'Unassigned'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Created By</h4>
              <p className="text-gray-900">
                {task.createdBy?.name} ({task.createdBy?.email})
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Due Date</h4>
              <p className="text-gray-900">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Created</h4>
              <p className="text-gray-900">
                {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h4>
              <p className="text-gray-900">
                {new Date(task.updatedAt).toLocaleDateString()} at {new Date(task.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDetail;