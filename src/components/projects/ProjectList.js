import React, { useState, useEffect } from 'react';
import { projectAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(id);
        setProjects(projects.filter(project => project._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <button
          onClick={() => navigate('/projects/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg mb-4">No projects yet</p>
          <button
            onClick={() => navigate('/projects/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Owner:</span> {project.owner?.name}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Members:</span> {project.members?.length || 0}
                </p>
                {project.deadline && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Deadline:</span> {new Date(project.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList;