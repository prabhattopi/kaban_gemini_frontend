import { useState } from 'react'

export default function NewItemForm({ onSubmit, placeholder='Name', cta='Add', extraFields }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onSubmit({ name: name.trim(), description: description.trim() })
    setName('')
    setDescription('')
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      {extraFields !== false && (
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      )}
      <button
        type="submit"
        className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        {cta}
      </button>
    </form>
  )
}