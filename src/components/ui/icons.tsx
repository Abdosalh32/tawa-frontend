import {
  Ellipsis,
  FolderTree,
  House,
  Info,
  Layers,
  Palette,
  Percent,
  Plus,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Users,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'

/**
 * أيقونات النظام — محوّل فوق `lucide-react` (قرار مالك المنتج، 17 أغسطس 2026).
 * الأسماء والواجهة كما كانت في المجموعة المرسومة يدوياً، فكل الشاشات تترقى دون تعديل.
 * أيقونات الملاحة 18px والأفعال المضمنة 16px، بسماكة 2 كما في الأصل، وكلها زخرفية
 * (`aria-hidden`) — النص المرافق أو `aria-label` هو حامل المعنى دائماً.
 */

const INLINE: LucideProps = { size: 16, strokeWidth: 2, absoluteStrokeWidth: true, 'aria-hidden': true, focusable: false }
const NAV: LucideProps = { size: 18, strokeWidth: 2, absoluteStrokeWidth: true, 'aria-hidden': true, focusable: false }

/* أفعال مضمنة — 16px */
export function PlusGlyph() {
  return <Plus {...INLINE} />
}

export function DotsGlyph() {
  return <Ellipsis {...INLINE} />
}

export function InfoGlyph() {
  return <Info {...INLINE} />
}

/* ملاحة وبنود قوائم — 18px */
export function HomeGlyph() {
  return <House {...NAV} />
}

export function OrdersGlyph() {
  return <ShoppingBag {...NAV} />
}

export function TagGlyph() {
  return <Tag {...NAV} />
}

export function LayersGlyph() {
  return <Layers {...NAV} />
}

export function PercentGlyph() {
  return <Percent {...NAV} />
}

export function PaletteGlyph() {
  return <Palette {...NAV} />
}

export function GearGlyph() {
  return <Settings {...NAV} />
}

export function UsersGlyph() {
  return <Users {...NAV} />
}

export function ShieldGlyph() {
  return <ShieldCheck {...NAV} />
}

export function ScrollGlyph() {
  return <ScrollText {...NAV} />
}

export function FolderTreeGlyph() {
  return <FolderTree {...NAV} />
}
