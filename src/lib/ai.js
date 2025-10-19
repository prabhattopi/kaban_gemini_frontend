import api from './api.js'

export const aiSummarizeProject = async (projectId) => {
  const { data } = await api.get(`/api/ai/summarize/${projectId}`)
  return data
}

export const aiTaskQA = async ({ taskId, question }) => {
  const { data } = await api.post(`/api/ai/qa`, { taskId, question })
  return data
}

export const aiSummarizeTask = async (taskId) => {
  const { data } = await api.get(`/api/ai/summarize-task/${taskId}`)
  return data
}