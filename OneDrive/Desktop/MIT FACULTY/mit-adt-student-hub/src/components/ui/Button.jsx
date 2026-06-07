import { Loader2 } from 'lucide-react';

/**
 * Button — primary / ghost / danger variants.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
}) {
  const base   = 'btn-' + variant;
  const sizes  = { sm: 'text-[13px] px-4 py-2.5', md: '', lg: 'text-[16px] px-6 py-4' };
  const width  = fullWidth ? 'w-full' : '';
  const cursor = disabled || loading ? 'cursor-not-allowed opacity-60' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${width} ${cursor} ${className}`}
    >
      {loading
        ? <Loader2 size={18} className="animate-spin" />
        : Icon && <Icon size={18} />
      }
      {children}
    </button>
  );
}
