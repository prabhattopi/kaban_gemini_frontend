export default function Loader({ label = 'Loading…', size = 16 }) {
    const px = `${size}px`
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600" role="status" aria-live="polite">
        <span
          className="inline-block rounded-full border-2 border-gray-300 border-t-transparent spinner-tailwind"
          style={{ width: px, height: px }}
        />
        <span>{label}</span>
      </div>
    )
  }