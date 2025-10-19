import { memo, useMemo } from 'react'
import Sparkles from './icons/Sparkles.jsx'

const STATUS_STYLES = {
  TODO: { dot: 'bg-red-500', label: 'TODO', chip: 'bg-red-100 text-red-700' },
  IN_PROGRESS: { dot: 'bg-yellow-500', label: 'IN PROGRESS', chip: 'bg-yellow-100 text-yellow-700' },
  DONE: { dot: 'bg-green-500', label: 'DONE', chip: 'bg-green-100 text-green-700' },
}

function TaskCardBase({ task, onDelete, onEdit, onAI }) {
  const status = STATUS_STYLES[task.status] || { dot: 'bg-gray-400', label: task.status, chip: 'bg-gray-100 text-gray-700' }

  const statusBadge = useMemo(() => (
    <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.chip}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${status.dot}`} />
      {status.label}
    </span>
  ), [status])

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {statusBadge}
            <h4 className="font-semibold text-gray-900 truncate">{task.title}</h4>
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onAI?.(task)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-purple-700 hover:bg-purple-50 border border-purple-200"
            title="Open AI Assistant for this task"
          >
            <Sparkles />
            AI
          </button>
          <button
            onClick={() => {
              const title = prompt('Update title', task.title) || task.title
              const description = prompt('Update description', task.description ?? '') ?? task.description
              onEdit(task._id, { title, description })
            }}
            className="text-xs text-blue-600 hover:underline"
            title="Edit task"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="text-xs text-red-600 hover:underline"
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(TaskCardBase)