/**
 * بيانات وأدوات شاشة «المظهر والقوالب» — محلية بالكامل، لا حفظ فعلياً.
 * D6 محسوم: حرية كاملة للتاجر في الألوان + اشتقاق نص مقروء آلياً + تحذير تباين دون منع.
 * ألوان الحالات الدلالية نظامية ولا تُستبدل بألوان التاجر.
 */

export type ColorRole = 'primary' | 'secondary' | 'background' | 'surface' | 'text'

export interface ColorRoleMeta {
  key: ColorRole
  label: string
  hint: string
}

export const COLOR_ROLES: readonly ColorRoleMeta[] = [
  { key: 'primary', label: 'اللون الأساسي', hint: 'الأزرار الرئيسية والعناصر البارزة' },
  { key: 'secondary', label: 'اللون الثانوي', hint: 'الروابط والتأكيدات المرافقة' },
  { key: 'background', label: 'لون خلفية المتجر', hint: 'أرضية الصفحات' },
  { key: 'surface', label: 'لون البطاقات والأسطح', hint: 'بطاقات المنتجات والهيدر' },
  { key: 'text', label: 'لون النص الأساسي', hint: 'نصوص المحتوى فوق الخلفية والأسطح' },
]

/** الافتراضيات من الـ Tokens المرجعية (قبل تخصيص التاجر) */
export const DEFAULT_COLORS: Record<ColorRole, string> = {
  primary: '#2a78d6',
  secondary: '#1c5cab',
  background: '#f9f9f7',
  surface: '#fcfcfb',
  text: '#0b0b0b',
}

export type TemplateKey = 'modern' | 'classic'

export const TEMPLATES: ReadonlyArray<{ key: TemplateKey; name: string; description: string }> = [
  { key: 'modern', name: 'عصري', description: 'بنر ترحيبي كبير وبطاقات واسعة بزوايا مستديرة' },
  { key: 'classic', name: 'كلاسيكي', description: 'ترويسة مركزية وقوائم منتجات مدمجة بحدود هادئة' },
]

/** تطبيع HEX: يقبل بشرطة أو بدونها، 6 خانات — يعيد null إن كانت الصيغة خاطئة */
export function normalizeHex(raw: string): string | null {
  const value = raw.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null
  return `#${value.toLowerCase()}`
}

/** الإسطاع النسبي (WCAG) */
function luminance(hex: string): number {
  const channels = [0, 2, 4].map((offset) => {
    const channel = parseInt(hex.slice(1 + offset, 3 + offset), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  const [r, g, b] = channels
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** نسبة التباين (WCAG) — من 1 إلى 21 */
export function contrastRatio(hexA: string, hexB: string): number {
  const [lighter, darker] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * اشتقاق نص مقروء آلياً فوق لون التاجر: أبيض أو أسود.
 * انحياز خفيف للأبيض (عُرف أزرار الواجهات ونظامنا المرجعي) ما لم يكن
 * الأسود أفضل بوضوح — يمنع انقلاب نص الأزرار أسودَ فوق الأزرق المرجعي بفارق ضئيل.
 */
export function readableOn(background: string): '#0b0b0b' | '#ffffff' {
  const whiteRatio = contrastRatio(background, '#ffffff')
  const blackRatio = contrastRatio(background, '#0b0b0b')
  return blackRatio > whiteRatio * 1.15 ? '#0b0b0b' : '#ffffff'
}

export interface ContrastWarning {
  key: string
  message: string
  ratio: number
}

/**
 * فحص التركيبات المهمة — تحذير دون منع الاختيار.
 * عتبة النصوص 4.5 (AA)، وعتبة العناصر العريضة/الرسومية (الأسعار والأزرار) 3.0 —
 * وبها تمر اللوحة الافتراضية المرجعية نظيفة.
 */
export function evaluateContrast(colors: Record<ColorRole, string>): ContrastWarning[] {
  const warnings: ContrastWarning[] = []
  const check = (key: string, ratio: number, message: string, threshold = 4.5) => {
    if (ratio < threshold) warnings.push({ key, ratio: Math.round(ratio * 10) / 10, message })
  }

  check(
    'text-background',
    contrastRatio(colors.text, colors.background),
    'النص الأساسي فوق خلفية المتجر ضعيف المقروئية',
  )
  check(
    'text-surface',
    contrastRatio(colors.text, colors.surface),
    'النص الأساسي فوق البطاقات والأسطح ضعيف المقروئية',
  )
  /* نص الأزرار عريض/عنصر واجهة — عتبته 3.0 (وبها يمر الأزرق المرجعي) */
  check(
    'on-primary',
    contrastRatio(colors.primary, readableOn(colors.primary)),
    'نص الأزرار فوق اللون الأساسي ضعيف حتى بعد الاشتقاق الآلي — جرّب درجة أغمق أو أفتح',
    3,
  )
  check(
    'on-secondary',
    contrastRatio(colors.secondary, readableOn(colors.secondary)),
    'النص فوق اللون الثانوي ضعيف حتى بعد الاشتقاق الآلي — جرّب درجة أغمق أو أفتح',
    3,
  )
  check(
    'primary-surface',
    contrastRatio(colors.primary, colors.surface),
    'اللون الأساسي (الأسعار والأزرار) فوق الأسطح ضعيف التمييز',
    3,
  )
  return warnings
}
