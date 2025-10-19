import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjects, createProject, deleteProject, updateProject } from '../lib/api.js'

export const useProjects = () => {
  const qc = useQueryClient()

  const list = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 60_000,
    gcTime: 5 * 60_000
  })

  const create = useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] })
  })

  const update = useMutation({
    mutationFn: updateProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] })
  })

  const remove = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] })
  })

  return { list, create, update, remove }
}