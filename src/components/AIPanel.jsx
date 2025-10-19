import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { aiSummarizeProject, aiTaskQA, aiSummarizeTask } from '../lib/ai.js'
import Loader from './Loader.jsx'
import Sparkles from './icons/Sparkles.jsx'
import Copy from './icons/Copy.jsx'

export default function AIPanel({ projectId, tasks = [] }) {
  const [qaText, setQaText] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?._id || '')

  const summarizeProject = useMutation({
    mutationFn: () => aiSummarizeProject(projectId),
    onSuccess: () => toast.success('Project summarized'),
    onError: () => toast.error('Failed to summarize project')
  })

  const summarizeSelectedTask = useMutation({
    mutationFn: () => aiSummarizeTask(selectedTaskId),
    onSuccess: () => toast.success('Task summarized'),
    onError: () => toast.error('Failed to summarize task')
  })

  const askSelectedTask = useMutation({
    mutationFn: () => aiTaskQA({ taskId: selectedTaskId, question: qaText }),
    onSuccess: () => toast.success('Answer ready'),
    onError: () => toast.error('Failed to get answer')
  })

  const selectedTask = useMemo(
    () => tasks.find(t => t._id === selectedTaskId),
    [tasks, selectedTaskId]
  )

  const copyText = (text) => {
    if (!text) return toast.error('Nothing to copy')
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => toast.success('Copied to clipboard'),
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
        toast.success('Copied to clipboard')
      } catch {
        toast.error('Copy failed')
      }
    }
  }

  return (
    <aside className="sticky top-4 h-fit rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-700" />
        <h3 className="text-lg font-semibold">AI Assistant</h3>
      </div>
      <p className="mt-1 text-xs text-gray-600">Summaries and Q&amp;A grounded by your current board.</p>

      {/* Summarize Project */}
      <section className="mt-4 space-y-2">
        <button
          onClick={() => summarizeProject.mutate()}
          className="w-full rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-60"
          disabled={summarizeProject.isLoading}
        >
          {summarizeProject.isLoading ? 'Summarizing Project…' : 'Summarize Project'}
        </button>

        {summarizeProject.isLoading && <Loader label="Summarizing project…" />}

        {summarizeProject.isError && <p className="text-sm text-red-600">Failed to summarize project.</p>}

        {summarizeProject.data?.summary && (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-purple-800">Project Summary</p>
              <button
                onClick={() => copyText(summarizeProject.data.summary)}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-purple-800 hover:bg-purple-100"
              >
                <Copy /> Copy
              </button>
            </div>
            <div className="prose max-w-none whitespace-pre-wrap text-sm text-gray-800">
              {summarizeProject.data.summary}
            </div>
          </div>
        )}
      </section>

      {/* Task selection */}
      <section className="mt-6">
        <label className="block text-sm font-medium">Selected task</label>
        <select
          className="mt-1 w-full rounded border px-3 py-2"
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
        >
          {tasks.map(t => (
            <option key={t._id} value={t._id}>
              [{t.status}] {t.title}
            </option>
          ))}
        </select>
        {selectedTask?.description && (
          <p className="mt-1 text-xs text-gray-500">{selectedTask.description}</p>
        )}
      </section>

      {/* Summarize selected task */}
      <section className="mt-4 space-y-2">
        <button
          onClick={() => summarizeSelectedTask.mutate()}
          className="w-full rounded bg-purple-100 px-4 py-2 text-purple-800 hover:bg-purple-200 disabled:opacity-60"
          disabled={summarizeSelectedTask.isLoading || !selectedTaskId}
        >
          {summarizeSelectedTask.isLoading ? 'Summarizing Task…' : 'Summarize Selected Task'}
        </button>

        {summarizeSelectedTask.isLoading && <Loader label="Summarizing task…" />}

        {summarizeSelectedTask.isError && <p className="text-sm text-red-600">Failed to summarize task.</p>}

        {summarizeSelectedTask.data?.summary && (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-purple-800">Task Summary</p>
              <button
                onClick={() => copyText(summarizeSelectedTask.data.summary)}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-purple-800 hover:bg-purple-100"
              >
                <Copy /> Copy
              </button>
            </div>
            <div className="prose max-w-none whitespace-pre-wrap text-sm text-gray-800">
              {summarizeSelectedTask.data.summary}
            </div>
          </div>
        )}
      </section>

      {/* Q&A */}
      <section className="mt-4 space-y-2">
        <label className="block text-sm font-medium">Ask about selected task</label>
        <textarea
          className="w-full rounded border px-3 py-2"
          rows={3}
          placeholder="e.g., What are the next steps?"
          value={qaText}
          onChange={(e) => setQaText(e.target.value)}
        />
        <button
          onClick={() => askSelectedTask.mutate()}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={askSelectedTask.isLoading || !qaText || !selectedTaskId}
        >
          {askSelectedTask.isLoading ? 'Thinking…' : 'Ask'}
        </button>

        {askSelectedTask.isLoading && <Loader label="Thinking…" />}

        {askSelectedTask.isError && <p className="text-sm text-red-600">Failed to get answer.</p>}

        {askSelectedTask.data?.answer && (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-800">AI Answer</p>
              <button
                onClick={() => copyText(askSelectedTask.data.answer)}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-800 hover:bg-blue-100"
              >
                <Copy /> Copy
              </button>
            </div>
            <div className="prose max-w-none whitespace-pre-wrap text-sm text-gray-800">
              {askSelectedTask.data.answer}
            </div>
          </div>
        )}
      </section>
    </aside>
  )
}
