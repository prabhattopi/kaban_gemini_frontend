import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

// -------- Projects
export const getProjects = async () => {
  const { data } = await api.get('/api/projects')
  return data
}

export const createProject = async (payload) => {
  const { data } = await api.post('/api/projects', payload)
  return data
}

export const updateProject = async ({ id, payload }) => {
  const { data } = await api.patch(`/api/projects/${id}`, payload)
  return data
}

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/api/projects/${id}`)
  return data
}

// -------- Tasks
export const getTasksByProject = async (projectId) => {
  const { data } = await api.get(`/api/tasks/project/${projectId}`)
  return data
}

export const createTask = async (payload) => {
  const { data } = await api.post(`/api/tasks`, payload)
  return data
}

export const updateTask = async ({ id, payload }) => {
  const { data } = await api.patch(`/api/tasks/${id}`, payload)
  return data
}

export const deleteTask = async (id) => {
  const { data } = await api.delete(`/api/tasks/${id}`)
  return data
}

// For Phase 4 (DnD)
export const reorderTask = async ({ taskId, toStatus, toIndex }) => {
  const { data } = await api.post(`/api/tasks/reorder`, { taskId, toStatus, toIndex })
  return data
}

export default api
