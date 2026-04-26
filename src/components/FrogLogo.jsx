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
      <circle cx="33" cy="27" r="11" />
      <circle cx="67" cy="27" r="11" />
      {/* Head */}
      <circle cx="50" cy="41" r="19" />
      {/* Body — small and round */}
      <ellipse cx="50" cy="66" rx="16" ry="14" />
      {/* Slender front arms */}
      <ellipse cx="25" cy="60" rx="10" ry="4" transform="rotate(-20 25 60)" />
      <ellipse cx="75" cy="60" rx="10" ry="4" transform="rotate(20 75 60)" />
      {/* Slim back feet splayed out */}
      <ellipse cx="31" cy="82" rx="14" ry="5" transform="rotate(-25 31 82)" />
      <ellipse cx="69" cy="82" rx="14" ry="5" transform="rotate(25 69 82)" />
    </svg>
  )
}
