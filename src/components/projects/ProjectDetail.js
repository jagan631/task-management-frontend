import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectAPI, taskAPI } from "../../utils/api";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await projectAPI.getById(id);
      setProject(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await taskAPI.getAll({ project: id });
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? All tasks will be lost."
      )
    ) {
      try {
        await projectAPI.delete(id);
        navigate("/projects");
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete project");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || "Project not found"}
      </div>
    );
  }

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/projects")}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
        </div>
        <button
          onClick={handleDeleteProject}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Delete Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Project Details
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Description:
                </span>
                <p className="text-gray-900 mt-1">
                  {project.description || "No description"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Status:
                </span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    project.status === "active"
                      ? "bg-green-100 text-green-800"
                      : project.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Owner:
                </span>
                <p className="text-gray-900 mt-1">
                  {project.owner?.name} ({project.owner?.email})
                </p>
              </div>
              {project.deadline && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Deadline:
                  </span>
                  <p className="text-gray-900 mt-1">
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Created:
                </span>
                <p className="text-gray-900 mt-1">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Task Overview
              </h3>
              <button
                onClick={() => navigate(`/tasks/new?project=${id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                + Add Task
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-3 rounded text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {taskStats.total}
                </p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {taskStats.todo}
                </p>
                <p className="text-xs text-yellow-700">To Do</p>
              </div>
              <div className="bg-blue-50 p-3 rounded text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {taskStats.inProgress}
                </p>
                <p className="text-xs text-blue-700">In Progress</p>
              </div>
              <div className="bg-purple-50 p-3 rounded text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {taskStats.review}
                </p>
                <p className="text-xs text-purple-700">Review</p>
              </div>
              <div className="bg-green-50 p-3 rounded text-center">
                <p className="text-2xl font-bold text-green-600">
                  {taskStats.done}
                </p>
                <p className="text-xs text-green-700">Done</p>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h3>
            {tasks.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No tasks yet. Create your first task!
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            task.status === "done"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : task.status === "review"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    {task.assignedTo && (
                      <p className="text-xs text-gray-500 mt-2">
                        Assigned to: {task.assignedTo.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Members Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Team Members
            </h3>
            <div className="space-y-3">
              {project.members?.map((member) => (
                <div key={member._id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.email}
                    </p>
                  </div>
                  {member._id === project.owner._id && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
