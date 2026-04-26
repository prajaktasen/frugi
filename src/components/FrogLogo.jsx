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
      <circle cx="33" cy="26" r="14" />
      <circle cx="67" cy="26" r="14" />
      {/* Head — round circle bridging the eyes */}
      <circle cx="50" cy="42" r="23" />
      {/* Body */}
      <ellipse cx="50" cy="68" rx="22" ry="19" />
      {/* Front arms */}
      <ellipse cx="22" cy="60" rx="12" ry="7" transform="rotate(-15 22 60)" />
      <ellipse cx="78" cy="60" rx="12" ry="7" transform="rotate(15 78 60)" />
      {/* Back feet */}
      <ellipse cx="30" cy="84" rx="17" ry="8" transform="rotate(-20 30 84)" />
      <ellipse cx="70" cy="84" rx="17" ry="8" transform="rotate(20 70 84)" />
    </svg>
  )
}
