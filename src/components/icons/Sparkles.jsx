export default function Sparkles({ className = 'w-4 h-4' }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5 11l2-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2zm10-8l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5L15 3zm3 12l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/>
      </svg>
    )
  }