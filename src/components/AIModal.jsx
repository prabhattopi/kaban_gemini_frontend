import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { aiSummarizeProject, aiTaskQA, aiSummarizeTask } from '../lib/ai.js'
import Loader from './Loader.jsx'
import Copy from './icons/Copy.jsx'
import Sparkles from './icons/Sparkles.jsx'

/**
 * Props:
 * - mode: 'assistant' | 'task'
 * - projectId: string
 * - tasks: Task[]
 * - initialTaskId: string | null
 * - autoSummarize: boolean (task mode only)
 * - onClose: () => void
 */
export default function AIModal({
  mode = 'assistant',
  projectId,
  tasks = [],
  initialTaskId = null,
  autoSummarize = false,
  onClose
}) {
  const hasTasks = tasks.length > 0
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId || (tasks[0]?._id || ''))
  const [qaText, setQaText] = useState('')

  // One-shot guard for React 18 StrictMode
  const hasAutoRunRef = useRef(false)
  const scrollRef = useRef(null)

  // --- Local pending flags for guaranteed loader visibility ---
  const [projectPending, setProjectPending] = useState(false)
  const [taskPending, setTaskPending] = useState(false)
  const [askPending, setAskPending] = useState(false)

  // Mutations
  const summarizeProject = useMutation({
    mutationFn: () => aiSummarizeProject(projectId),
    onMutate: () => {
      setProjectPending(true)
      queueMicrotask(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }))
    },
    onError: () => toast.error('Failed to summarize project'),
    onSettled: () => setProjectPending(false)
  })

  const summarizeTask = useMutation({
    mutationFn: () => aiSummarizeTask(selectedTaskId),
    onMutate: () => {
      setTaskPending(true)
      queueMicrotask(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }))
    },
    onError: () => toast.error('Failed to summarize task'),
    onSettled: () => setTaskPending(false)
  })

  const askTask = useMutation({
    mutationFn: () => aiTaskQA({ taskId: selectedTaskId, question: qaText }),
    onMutate: () => {
      setAskPending(true)
      queueMicrotask(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }))
    },
    onError: () => toast.error('Failed to get answer'),
    onSettled: () => setAskPending(false)
  })

  // Auto summarize exactly once when opened from a card (mode="task")
  useEffect(() => {
    if (mode === 'task' && autoSummarize && selectedTaskId && !hasAutoRunRef.current) {
      hasAutoRunRef.current = true
      summarizeTask.mutate()
    }
  }, [mode, autoSummarize, selectedTaskId]) // eslint-disable-line

  // Reset one-shot guard between openings
  useEffect(() => {
    hasAutoRunRef.current = false
  }, [initialTaskId, mode, autoSummarize])

  const selectedTask = useMemo(
    () => tasks.find(t => t._id === selectedTaskId),
    [tasks, selectedTaskId]
  )

  // Reset results only when the user changes the task (not via effects)
  const handleTaskChange = (e) => {
    const nextId = e.target.value
    setSelectedTaskId(nextId)
    summarizeTask.reset()
    askTask.reset()
    setQaText('')
  }

  const copyText = (text) => {
    if (!text) return toast.error('Nothing to copy')
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => toast.success('Copied'),
        () => toast.error('Copy failed')
      )
    } else {
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        toast.success('Copied')
      } catch {
        toast.error('Copy failed')
      }
    }
  }

  // Compute disabled states centrally
  const disableProjectBtn = projectPending
  const disableTaskSelect = !hasTasks || taskPending || askPending || projectPending
  const disableTaskBtn = !hasTasks || taskPending
  const disableAskTextarea = !hasTasks || askPending || taskPending || projectPending
  const disableAskBtn = !hasTasks || askPending || !qaText.trim()

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white/90 px-6 py-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'task' ? 'AI Assistant — Task' : 'AI Assistant'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Project Overview — only in assistant mode */}
            {mode === 'assistant' && (
              <section className="space-y-2">
                <button
                  onClick={() => summarizeProject.mutate()}
                  className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 hover:opacity-95 disabled:opacity-60"
                  disabled={disableProjectBtn}
                  aria-busy={projectPending}
                >
                  {projectPending ? 'Summarizing Project…' : 'Summarize Project'}
                </button>

                {projectPending && (
                  <div className="rounded-lg border bg-purple-50 p-3">
                    <Loader label="Summarizing project..." />
                  </div>
                )}

                {summarizeProject.data?.summary && !projectPending && (
                  <div className="rounded-lg border bg-purple-50 p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-semibold text-purple-800">Project Summary</span>
                      <button
                        onClick={() => copyText(summarizeProject.data.summary)}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-purple-800 hover:bg-purple-100"
                      >
                        <Copy /> Copy
                      </button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{summarizeProject.data.summary}</p>
                  </div>
                )}
              </section>
            )}

            {/* Task tools (both modes) */}
            <section className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">Select task</label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                <select
                  className="rounded-lg border px-3 py-2"
                  value={selectedTaskId}
                  onChange={handleTaskChange}
                  disabled={disableTaskSelect}
                  aria-busy={taskPending || askPending || projectPending}
                >
                  {tasks.map(t => (
                    <option key={t._id} value={t._id}>
                      [{t.status}] {t.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => summarizeTask.mutate()}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 text-white hover:opacity-95 disabled:opacity-60"
                  disabled={disableTaskBtn}
                  aria-busy={taskPending}
                >
                  {taskPending ? 'Summarizing…' : 'Summarize Task'}
                </button>
              </div>

              {/* Task description */}
              {selectedTask?.description && (
                <div className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTask.description}</p>
                </div>
              )}

              {/* Task loader */}
              {taskPending && (
                <div className="rounded-lg border bg-purple-50 p-3">
                  <Loader label="Summarizing task..." />
                </div>
              )}

              {/* Task summary */}
              {summarizeTask.data?.summary && !taskPending && (
                <div className="rounded-lg border bg-purple-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-800">Task Summary</span>
                    <button
                      onClick={() => copyText(summarizeTask.data.summary)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-purple-800 hover:bg-purple-100"
                    >
                      <Copy /> Copy
                    </button>
                  </div>
                  <div className="prose max-w-none whitespace-pre-wrap text-sm text-gray-800">
                    {summarizeTask.data.summary}
                  </div>
                </div>
              )}

              {!taskPending && !summarizeTask.data?.summary && hasTasks && (
                <p className="text-xs text-gray-500">Click “Summarize Task” to generate a summary.</p>
              )}

              {!hasTasks && (
                <p className="text-sm text-gray-500">No tasks available. Create a task to use AI.</p>
              )}
            </section>

            {/* Q&A output */}
            {askTask.data?.answer && !askPending && (
              <section className="space-y-2">
                <p className="text-sm font-semibold text-gray-800">AI Answer</p>
                <div className="rounded-lg border bg-blue-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-800">Answer</span>
                    <button
                      onClick={() => copyText(askTask.data.answer)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-800 hover:bg-blue-100"
                    >
                      <Copy /> Copy
                    </button>
                  </div>
                  <div className="prose max-w-none whitespace-pre-wrap text-sm text-gray-800">
                    {askTask.data.answer}
                  </div>
                </div>
              </section>
            )}

            {/* Spacer so sticky footer doesn't overlap content */}
            <div className="h-4" />
          </div>

          {/* Sticky Ask bar */}
          <div className="sticky bottom-0 z-10 border-t bg-white/95 px-6 py-3 backdrop-blur">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
              <textarea
                className="min-h-[44px] max-h-40 rounded-lg border px-3 py-2"
                rows={2}
                placeholder={hasTasks ? 'Ask about this task…' : 'No task selected'}
                value={qaText}
                onChange={(e) => setQaText(e.target.value)}
                disabled={disableAskTextarea}
                aria-busy={askPending}
              />
              <button
                onClick={() => askTask.mutate()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={disableAskBtn}
              >
                {askPending ? 'Thinking…' : 'Ask'}
              </button>
            </div>
            {askPending && (
              <div className="mt-2">
                <Loader label="Thinking..." />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}