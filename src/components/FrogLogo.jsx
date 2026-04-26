export default function FrogLogo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Eye bumps */}
      <circle cx="32" cy="22" r="12" />
      <circle cx="68" cy="22" r="12" />
      {/* Head */}
      <ellipse cx="50" cy="37" rx="26" ry="16" />
      {/* Body */}
      <ellipse cx="50" cy="63" rx="28" ry="22" />
      {/* Left front leg */}
      <path d="M22,49 C10,44 3,53 5,61 C7,67 16,67 22,61 Z" />
      {/* Right front leg */}
      <path d="M78,49 C90,44 97,53 95,61 C93,67 84,67 78,61 Z" />
      {/* Left back leg */}
      <path d="M22,73 C7,73 -1,83 3,91 C7,97 18,95 25,87 C28,82 26,77 22,73 Z" />
      {/* Right back leg */}
      <path d="M78,73 C93,73 101,83 97,91 C93,97 82,95 75,87 C72,82 74,77 78,73 Z" />
    </svg>
  )
}
