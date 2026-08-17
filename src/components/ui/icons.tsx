/**
 * أيقونات خطية مشتركة بسمك 2px (design-system-foundations §6).
 * زخرفية دائماً — تُعرض داخل حاويات aria-hidden والنص هو حامل المعنى.
 */

export function PlusGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 3v10M3 8h10" />
    </svg>
  )
}

export function DotsGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  )
}

export function InfoGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.5v3M8 5v.5" />
    </svg>
  )
}

export function HomeGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M3 8l6-5 6 5v7H3V8z" />
    </svg>
  )
}

export function OrdersGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M3 6l6-3 6 3v6l-6 3-6-3V6zM3 6l6 3 6-3M9 9v6" />
    </svg>
  )
}

export function TagGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M9 2h6v6l-7 7-6-6 7-7z" />
      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function LayersGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M9 2l7 4-7 4-7-4 7-4zM2 10l7 4 7-4" />
    </svg>
  )
}

export function PercentGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 14L14 4" />
      <circle cx="5.5" cy="5.5" r="2" />
      <circle cx="12.5" cy="12.5" r="2" />
    </svg>
  )
}

export function PaletteGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 2a7 7 0 100 14c1.2 0 1.8-.8 1.8-1.7 0-.9-.6-1.3-.6-2 0-.8.7-1.3 1.6-1.3H13a3 3 0 003-3C16 4.5 12.8 2 9 2z" />
      <circle cx="6" cy="7" r="0.5" fill="currentColor" />
      <circle cx="9.5" cy="5.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

export function GearGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 2v2.5M9 13.5V16M2 9h2.5M13.5 9H16M4 4l1.8 1.8M12.2 12.2L14 14M14 4l-1.8 1.8M5.8 12.2L4 14" />
    </svg>
  )
}

export function UsersGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="7" cy="6" r="3" />
      <path d="M2 15c0-2.5 2.2-4 5-4s5 1.5 5 4M13 3.5a3 3 0 010 5M16 15c0-2-1.2-3.3-3-3.8" />
    </svg>
  )
}

export function ShieldGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M9 2l6 2v5c0 3.5-2.5 6-6 7-3.5-1-6-3.5-6-7V4l6-2z" />
    </svg>
  )
}

export function ScrollGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 2h9v14H5a2 2 0 01-2-2V4a2 2 0 012-2zM7 6h5M7 9h5M7 12h3" />
    </svg>
  )
}

export function FolderTreeGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4a1 1 0 011-1h4l2 2h6a1 1 0 011 1v2H2V4zM2 8h14v5a1 1 0 01-1 1H3a1 1 0 01-1-1V8z" />
    </svg>
  )
}
