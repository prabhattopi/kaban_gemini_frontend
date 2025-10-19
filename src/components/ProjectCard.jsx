import { Link } from 'react-router-dom'

export default function ProjectCard({ project, onDelete }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          {project.description && (
            <p className="mt-1 text-sm text-gray-600">{project.description}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Created {new Date(project.createdAt || project.created_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => onDelete(project._id)}
          className="text-red-600 text-sm hover:underline"
        >
          Delete
        </button>
      </div>

      <div className="mt-4">
        <Link
          to={`/project/${project._id}`}
          className="inline-flex items-center rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black"
        >
          Open Board →
        </Link>
      </div>
    </div>
  )
}
