/**
 * Chip — filter chiclet / tag.
 * active prop makes it primary-color filled.
 */
export default function Chip({ children, active = false, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${active ? 'chip-active' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
