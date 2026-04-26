export default function FrogLogo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size * 0.82}
      viewBox="0 0 100 82"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Dark outline — wide flat face */}
      <ellipse cx="50" cy="50" rx="48" ry="36" fill="#1a1a1a" />

      {/* Eye bump outlines */}
      <circle cx="27" cy="22" r="16" fill="#1a1a1a" />
      <circle cx="73" cy="22" r="16" fill="#1a1a1a" />

      {/* Main face green */}
      <ellipse cx="50" cy="50" rx="44" ry="32" fill="#2ebd52" />

      {/* Eye bumps green */}
      <circle cx="27" cy="22" r="13" fill="#2ebd52" />
      <circle cx="73" cy="22" r="13" fill="#2ebd52" />

      {/* Chin / belly — light yellow-green */}
      <ellipse cx="50" cy="62" rx="36" ry="20" fill="#aadf3a" />

      {/* Eye yellow rings */}
      <circle cx="27" cy="22" r="10" fill="#aadf3a" />
      <circle cx="73" cy="22" r="10" fill="#aadf3a" />

      {/* Pupils */}
      <circle cx="27" cy="22" r="5.5" fill="#1a1a1a" />
      <circle cx="73" cy="22" r="5.5" fill="#1a1a1a" />

      {/* Eye shine */}
      <circle cx="29.5" cy="19.5" r="1.8" fill="#fff" />
      <circle cx="75.5" cy="19.5" r="1.8" fill="#fff" />

      {/* Nostrils */}
      <rect x="43" y="44" width="4" height="2.5" rx="1.2" fill="#1a1a1a" transform="rotate(-8 45 45)" />
      <rect x="53" y="44" width="4" height="2.5" rx="1.2" fill="#1a1a1a" transform="rotate(8 55 45)" />

      {/* Smile */}
      <path d="M 18 58 Q 50 72 82 58" stroke="#1a1a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* Dimples */}
      <path d="M 14 54 Q 12 58 16 61" stroke="#1a1a1a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 86 54 Q 88 58 84 61" stroke="#1a1a1a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  )
}