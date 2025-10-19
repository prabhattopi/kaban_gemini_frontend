import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasksByProject, createTask, updateTask, deleteTask, reorderTask } from '../lib/api.js'

export const useTasks = (projectId) => {
  const qc = useQueryClient()

  const list = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
    // avoid focus refetch jitter during DnD
    refetchOnWindowFocus: false,
    staleTime: 10_000
  })

  const create = useMutation({
    mutationFn: createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] })
  })

  const update = useMutation({
    mutationFn: updateTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] })
  })

  const remove = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] })
  })

  // Optimistic reorder without immediate invalidation
  const reorder = useMutation({
    mutationFn: reorderTask,
    onMutate: async ({ taskId, toStatus, toIndex }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] })
      const prev = qc.getQueryData(['tasks', projectId])

      // optimistic: rearrange within cached list
      if (prev && Array.isArray(prev)) {
        const next = [...prev]
        const idx = next.findIndex(t => t._id === taskId)
        if (idx !== -1) {
          const moved = next[idx]
          // remove from prev position
          next.splice(idx, 1)
          // compute insertion index among tasks of toStatus
          // Build an ordered list of tasks with toStatus
          const destIndices = next
            .map((t, i) => ({ t, i }))
            .filter(({ t }) => t.status === toStatus)
            .map(({ i }) => i)

          // Find absolute index in list to insert after/toIndex within that status
          let absoluteInsertIndex = destIndices[toIndex] ?? destIndices[destIndices.length - 1] + 1 ?? next.length
          if (destIndices.length === 0) absoluteInsertIndex = next.length

          moved.status = toStatus
          next.splice(absoluteInsertIndex, 0, moved)

          // reassign order within each status (dense)
          const byStatus = { TODO: [], IN_PROGRESS: [], DONE: [] }
          for (const t of next) byStatus[t.status].push(t)
          for (const s of Object.keys(byStatus)) {
            byStatus[s].forEach((t, i) => t.order = i)
          }
        }
        qc.setQueryData(['tasks', projectId], next)
      }

      // snapshot for rollback
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks', projectId], ctx.prev)
    },
    onSuccess: (data, vars) => {
      // Optionally update just the moved task from server response
      const current = qc.getQueryData(['tasks', projectId])
      if (current) {
        const next = current.map(t => (t._id === vars.taskId ? data : t))
        qc.setQueryData(['tasks', projectId], next)
      }
    },
    onSettled: () => {
      // gentle refetch to confirm without immediate flicker
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
    }
  })

  return { list, create, update, remove, reorder }
}
