import { useProjects } from '../hooks/useProjects.js'
import ProjectCard from '../components/ProjectCard.jsx'
import NewItemForm from '../components/NewItemForm.jsx'

export default function ProjectsPage() {
  const { list, create, remove } = useProjects()

  const handleCreate = (payload) => {
    create.mutate(payload)
  }

  const handleDelete = (id) => {
    if (confirm('Delete this project?')) remove.mutate(id)
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold">Projects</h2>
        <p className="text-gray-600">Manage your projects and open boards.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {list.isLoading && <p>Loading projects…</p>}
        {list.isError && <p className="text-red-600">Failed to load projects.</p>}
        {list.data?.map(p => (
          <ProjectCard key={p._id} project={p} onDelete={handleDelete} />
        ))}
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">New Project</h3>
        <NewItemForm onSubmit={handleCreate} placeholder="Project name" />
      </section>
    </div>
  )
}
