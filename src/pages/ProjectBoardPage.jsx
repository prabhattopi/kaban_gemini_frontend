import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useTasks } from '../hooks/useTasks.js'
import { STATUSES } from '../lib/status.js'
import TaskCard from '../components/TaskCard.jsx'
import NewItemForm from '../components/NewItemForm.jsx'
import AIModal from '../components/AIModal.jsx'

const emptyColumns = STATUSES.reduce((acc, s) => { acc[s.key] = []; return acc }, {})

export default function ProjectBoardPage() {
  const { projectId } = useParams()
  const { list, create, update, remove, reorder } = useTasks(projectId)
  const [columns, setColumns] = useState(emptyColumns)

  // AI modal state
  const [showModal, setShowModal] = useState(false)
  const [modalInitialTaskId, setModalInitialTaskId] = useState(null)
  const [modalAutoSummarize, setModalAutoSummarize] = useState(false)
  const [modalMode, setModalMode] = useState('assistant') // 'assistant' | 'task'

  // Hydrate columns with preserved order
  useEffect(() => {
    if (!list.data) return
    const next = STATUSES.reduce((acc, s) => { acc[s.key] = []; return acc }, {})
    for (const t of list.data) next[t.status].push(t)
    next.TODO.sort((a,b) => a.order - b.order)
    next.IN_PROGRESS.sort((a,b) => a.order - b.order)
    next.DONE.sort((a,b) => a.order - b.order)
    setColumns(next)
  }, [list.data])

  const handleCreateTask = ({ name, description }) => {
    if (!name) return
    create.mutate({ projectId, title: name, description, status: 'TODO' })
  }

  const handleDeleteTask = (id) => {
    if (confirm('Delete this task?')) remove.mutate(id)
  }

  const handleEditTask = (id, payload) => {
    update.mutate({ id, payload })
  }

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    const fromStatus = source.droppableId
    const toStatus = destination.droppableId
    const fromIndex = source.index
    const toIndex = destination.index

    // Optimistic local reorder
    setColumns(prev => {
      const next = { ...prev }
      const fromArr = [...next[fromStatus]]
      const [moved] = fromArr.splice(fromIndex, 1)
      const toArr = fromStatus === toStatus ? fromArr : [...next[toStatus]]
      toArr.splice(toIndex, 0, moved)
      next[fromStatus] = fromArr
      next[toStatus] = toArr
      return next
    })

    // Persist
    reorder.mutate({ taskId: draggableId, toStatus, toIndex })
  }

  const allTasks = list.data || []

  // Floating assistant → open modal in assistant mode (NO auto summarize)
  const openAIModalForProject = () => {
    setModalMode('assistant')
    setModalInitialTaskId(allTasks[0]?._id ?? null) // preselect for convenience
    setModalAutoSummarize(false) // important: no auto call in assistant mode
    setShowModal(true)
  }

  // Card AI → open modal in task mode and auto summarize that task
  const openAIModalForTask = (task) => {
    setModalMode('task')
    setModalInitialTaskId(task._id)
    setModalAutoSummarize(true) // auto summarize this task
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Project Board</h2>
          <p className="text-gray-500 text-sm">Project ID: <code>{projectId}</code></p>
        </div>
        <Link to="/" className="text-blue-600 hover:underline text-sm">← Back to Projects</Link>
      </div>

      {/* Full-width Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DragDropContext onDragEnd={onDragEnd}>
          {STATUSES.map(({ key, label }) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-3 rounded-xl border bg-white shadow-sm p-4 items-start min-h-[220px]"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
                    <span className="text-xs text-gray-500">{columns[key]?.length ?? 0}</span>
                  </div>

                  <div className="space-y-3 w-full">
                    {columns[key]?.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition ${snapshot.isDragging ? 'opacity-70' : ''}`}
                          >
                            <TaskCard
                              task={task}
                              onDelete={handleDeleteTask}
                              onEdit={handleEditTask}
                              onAI={openAIModalForTask}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>

                  {key === 'TODO' && (
                    <div className="mt-3 w-full">
                      <NewItemForm
                        onSubmit={handleCreateTask}
                        placeholder="New task title"
                        extraFields={true}
                        cta="Add Task"
                      />
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>

      {/* Floating AI Button — opens modal without API calls */}
      <button
        onClick={openAIModalForProject}
        className="fixed bottom-6 right-6 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 shadow-lg hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-purple-300"
        aria-label="Open AI Assistant"
      >
        AI Assistant
      </button>

      {/* AI Modal */}
      {showModal && (
        <AIModal
          mode={modalMode}                // 'assistant' | 'task'
          projectId={projectId}
          tasks={allTasks}
          initialTaskId={modalInitialTaskId}
          autoSummarize={modalAutoSummarize}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}