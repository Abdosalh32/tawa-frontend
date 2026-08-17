/**
 * أساسيات ثيم المتجر — محلية بالكامل، لا حفظ فعلياً.
 *
 * **مطابقة لعقد الباكند** (`store_themes` · `CustomizeThemeRequest` · `ThemeSeeder`):
 * - الأدوار اللونية الستة هي مفاتيح `colors` حرفياً: `primary` · `secondary` ·
 *   `header_bg` · `footer_bg` · `text_color` · `background`.
 *   لا يوجد مفتاح `surface` في العقد، فلون البطاقات **يُشتق محلياً** من `background`.
 * - `header_bg` و`footer_bg` يقبلان حتى 100 حرف (والافتراضي في قالب «مودرن» شفافية
 *   `rgba(...)`)، وبقية الأدوار حتى 50 حرفاً.
 * - `sections` مصفوفة `{ id, type, title, visible, settings }` — **ترتيبها هو ترتيب
 *   العرض** (المتطلب 1.3.4)، وقيمها الافتراضية منقولة من `ThemeSeeder`.
 *
 * D6 محسوم: حرية كاملة للتاجر في الألوان + اشتقاق نص مقروء آلياً + تحذير تباين دون منع.
 * ألوان الحالات الدلالية نظامية ولا تُستبدل بألوان التاجر.
 */

export type ColorRole = 'primary' | 'secondary' | 'header_bg' | 'footer_bg' | 'text_color' | 'background'

export interface ColorRoleMeta {
  key: ColorRole
  label: string
  hint: string
  /** حد الطول في `CustomizeThemeRequest` */
  maxLength: number
  /** أدوار الخلفيات تقبل `rgba()` (زجاجية قالب «مودرن») */
  allowsAlpha: boolean
}

export const COLOR_ROLES: readonly ColorRoleMeta[] = [
  { key: 'primary', label: 'اللون الأساسي', hint: 'الأزرار الرئيسية والأسعار', maxLength: 50, allowsAlpha: false },
  { key: 'secondary', label: 'اللون الثانوي', hint: 'الروابط والتأكيدات المرافقة', maxLength: 50, allowsAlpha: false },
  { key: 'header_bg', label: 'خلفية الترويسة', hint: 'شريط أعلى المتجر — يقبل شفافية rgba()', maxLength: 100, allowsAlpha: true },
  { key: 'footer_bg', label: 'خلفية التذييل', hint: 'شريط أسفل المتجر — يقبل شفافية rgba()', maxLength: 100, allowsAlpha: true },
  { key: 'text_color', label: 'لون النص الأساسي', hint: 'نصوص المحتوى فوق خلفية المتجر', maxLength: 50, allowsAlpha: false },
  { key: 'background', label: 'لون خلفية المتجر', hint: 'أرضية الصفحات — لون البطاقات يُشتق منها', maxLength: 50, allowsAlpha: false },
]

export type ThemeColors = Record<ColorRole, string>

export type TemplateKey = 'classic' | 'modern'

export const TEMPLATES: ReadonlyArray<{ key: TemplateKey; name: string; description: string }> = [
  { key: 'classic', name: 'كلاسيك الأنيق', description: 'ترويسة داكنة بلمسة ذهبية وقوائم منتجات مدمجة' },
  { key: 'modern', name: 'مودرن العصري', description: 'واجهة داكنة بتأثير زجاجي وبطاقات واسعة' },
]

/** ألوان كل قالب كما في `themes.default_colors` (ThemeSeeder) */
export const THEME_DEFAULT_COLORS: Record<TemplateKey, ThemeColors> = {
  classic: {
    primary: '#1a365d',
    secondary: '#c69214',
    header_bg: '#1a365d',
    footer_bg: '#0f172a',
    text_color: '#1e293b',
    background: '#f8fafc',
  },
  modern: {
    primary: '#6366f1',
    secondary: '#10b981',
    header_bg: 'rgba(15, 23, 42, 0.8)',
    footer_bg: '#090d16',
    text_color: '#f8fafc',
    background: '#0b0f19',
  },
}

/** أنواع الأقسام الموجودة فعلياً في مكتبة القوالب */
export type SectionType = 'hero' | 'categories' | 'products'

export const SECTION_TYPE_LABEL: Record<SectionType, string> = {
  hero: 'بنر رئيسي',
  categories: 'التصنيفات',
  products: 'شبكة منتجات',
}

export type SectionSettingValue = string | number | boolean

export interface ThemeSection {
  id: string
  type: SectionType
  title: string
  visible: boolean
  /** إعدادات خاصة بالقالب — تُعرض للقراءة فقط (لا تحريرها في هذه المرحلة) */
  settings?: Readonly<Record<string, SectionSettingValue>>
}

/** أقسام كل قالب كما في `themes.default_sections` (ThemeSeeder) */
export const THEME_DEFAULT_SECTIONS: Record<TemplateKey, readonly ThemeSection[]> = {
  classic: [
    {
      id: 'hero_3d_banner',
      type: 'hero',
      title: 'بنر العروض ثلاثي الأبعاد التفاعلي',
      visible: true,
      settings: { enable_3d_tilt: true, auto_play: true, height: 'medium', animation_speed: '0.8s' },
    },
    {
      id: 'categories_slider',
      type: 'categories',
      title: 'تصفح الفئات الرئيسية',
      visible: true,
      settings: { layout: 'carousel', enable_hover_zoom: true, border_radius: '12px' },
    },
    {
      id: 'featured_products_grid',
      type: 'products',
      title: 'منتجاتنا المميزة',
      visible: true,
      settings: { columns: 4, enable_3d_card_effect: true, show_price: true, show_add_to_cart: true },
    },
  ],
  modern: [
    {
      id: 'futuristic_slider',
      type: 'hero',
      title: 'واجهة عرض ثلاثية الأبعاد تفاعلية',
      visible: true,
      settings: { enable_glassmorphism: true, enable_glow: true, height: 'large' },
    },
    {
      id: 'interactive_categories',
      type: 'categories',
      title: 'أقسام التسوق',
      visible: true,
      settings: { layout: 'grid', glow_borders: true },
    },
    {
      id: 'modern_products_grid',
      type: 'products',
      title: 'أحدث المنتجات الممتازة',
      visible: true,
      settings: { columns: 3, enable_3d_hover_glow: true, enable_interactive_buy_button: true },
    },
  ],
}

/* ═══════════════ تحليل الألوان والتباين ═══════════════ */

interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

/** تطبيع HEX: يقبل 3 أو 6 خانات بشرطة أو بدونها — يعيد null إن كانت الصيغة خاطئة */
export function normalizeHex(raw: string): string | null {
  const value = raw.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    const [r, g, b] = value.toLowerCase()
    return `#${r}${r}${g}${g}${b}${b}`
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null
  return `#${value.toLowerCase()}`
}

/** يقبل HEX و`rgb()` و`rgba()` — أي ما تقبله قيم الثيم في الباكند */
export function parseColor(raw: string): Rgba | null {
  const hex = normalizeHex(raw)
  if (hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
      a: 1,
    }
  }
  const match = raw.trim().match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i)
  if (!match) return null
  const [r, g, b] = [match[1], match[2], match[3]].map((part) => Number(part))
  const a = match[4] === undefined ? 1 : Number(match[4])
  if ([r, g, b].some((channel) => !Number.isFinite(channel) || channel < 0 || channel > 255)) return null
  if (!Number.isFinite(a) || a < 0 || a > 1) return null
  return { r, g, b, a }
}

/** دمج لون شبه شفاف فوق أرضية صلبة — لازم لحساب تباين الترويسة الزجاجية */
export function flatten(value: string, backdrop: string): string {
  const top = parseColor(value)
  const base = parseColor(backdrop)
  if (!top) return backdrop
  if (!base || top.a >= 1) {
    const solid = top
    return `#${[solid.r, solid.g, solid.b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
  }
  const mix = (channel: 'r' | 'g' | 'b') => Math.round(top[channel] * top.a + base[channel] * (1 - top.a))
  return `#${(['r', 'g', 'b'] as const).map((channel) => mix(channel).toString(16).padStart(2, '0')).join('')}`
}

/** الإسطاع النسبي (WCAG) */
function luminance(color: string): number {
  const rgb = parseColor(color) ?? { r: 255, g: 255, b: 255, a: 1 }
  const channels = [rgb.r, rgb.g, rgb.b].map((raw) => {
    const channel = raw / 255
    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  const [r, g, b] = channels
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** نسبة التباين (WCAG) — من 1 إلى 21؛ الشفافية تُدمج فوق الطرف الآخر */
export function contrastRatio(colorA: string, colorB: string): number {
  const solidB = flatten(colorB, '#ffffff')
  const solidA = flatten(colorA, solidB)
  const [lighter, darker] = [luminance(solidA), luminance(solidB)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * اشتقاق نص مقروء آلياً فوق لون التاجر: أبيض أو أسود.
 * انحياز خفيف للأبيض (عُرف أزرار الواجهات) ما لم يكن الأسود أفضل بوضوح.
 * `backdrop` تُستخدم حين يكون اللون شبه شفاف (الترويسة الزجاجية).
 */
export function readableOn(background: string, backdrop = '#ffffff'): '#0b0b0b' | '#ffffff' {
  const solid = flatten(background, backdrop)
  const whiteRatio = contrastRatio(solid, '#ffffff')
  const blackRatio = contrastRatio(solid, '#0b0b0b')
  return blackRatio > whiteRatio * 1.15 ? '#0b0b0b' : '#ffffff'
}

/**
 * لون البطاقات والأسطح — **مشتق محلياً** لأن العقد لا يحمل `surface`:
 * خلفية فاتحة ⇒ بطاقات أقرب للأبيض · خلفية داكنة ⇒ رفعة خفيفة تفصل البطاقة عن الأرضية.
 */
export function deriveSurface(background: string): string {
  const solid = flatten(background, '#ffffff')
  const rgb = parseColor(solid) ?? { r: 255, g: 255, b: 255, a: 1 }
  const isDark = luminance(solid) < 0.5
  const amount = isDark ? 0.09 : 0.55
  const mixed = (['r', 'g', 'b'] as const).map((channel) => Math.round(rgb[channel] + (255 - rgb[channel]) * amount))
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

export interface ColorValueCheck {
  value?: string
  error?: string
}

/** تحقق محلي من قيمة دور لوني وفق حدود العقد وصيغه المقبولة */
export function validateColorValue(role: ColorRoleMeta, raw: string): ColorValueCheck {
  const value = raw.trim()
  if (value === '') return { error: 'أدخل قيمة لون' }
  if (value.length > role.maxLength) {
    return { error: `الحد الأقصى ${role.maxLength} حرفاً لهذا الحقل` }
  }
  const hex = normalizeHex(value)
  if (hex) return { value: hex }
  if (role.allowsAlpha) {
    const parsed = parseColor(value)
    if (parsed) return { value }
    return { error: 'أدخل HEX من 6 خانات أو rgba() — مثل #1a365d أو rgba(15, 23, 42, 0.8)' }
  }
  return { error: 'أدخل قيمة HEX صحيحة من 6 خانات — مثل #1a365d' }
}

export interface ContrastWarning {
  key: string
  message: string
  ratio: number
}

/**
 * فحص التركيبات المهمة — تحذير دون منع الاختيار.
 * عتبة النصوص 4.5 (AA)، وعتبة العناصر العريضة/الرسومية (الأسعار والأزرار) 3.0.
 * ألوان القوالب الافتراضية (كلاسيك ومودرن) تمر نظيفة بلا تحذير.
 */
export function evaluateContrast(colors: ThemeColors): ContrastWarning[] {
  const warnings: ContrastWarning[] = []
  const check = (key: string, ratio: number, message: string, threshold = 4.5) => {
    if (ratio < threshold) warnings.push({ key, ratio: Math.round(ratio * 10) / 10, message })
  }
  const surface = deriveSurface(colors.background)

  check(
    'text-background',
    contrastRatio(colors.text_color, colors.background),
    'النص الأساسي فوق خلفية المتجر ضعيف المقروئية',
  )
  check(
    'text-surface',
    contrastRatio(colors.text_color, surface),
    'النص الأساسي فوق البطاقات (المشتقة من خلفية المتجر) ضعيف المقروئية',
  )
  /* نص الأزرار عريض/عنصر واجهة — عتبته 3.0 */
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
    'primary-background',
    contrastRatio(colors.primary, colors.background),
    'اللون الأساسي (الأسعار والأزرار) فوق خلفية المتجر ضعيف التمييز',
    3,
  )
  /* الترويسة والتذييل: النص فيهما مشتق آلياً، والشفافية تُدمج فوق خلفية المتجر */
  check(
    'on-header',
    contrastRatio(flatten(colors.header_bg, colors.background), readableOn(colors.header_bg, colors.background)),
    'نص الترويسة ضعيف المقروئية فوق خلفيتها حتى بعد الاشتقاق الآلي',
  )
  check(
    'on-footer',
    contrastRatio(flatten(colors.footer_bg, colors.background), readableOn(colors.footer_bg, colors.background)),
    'نص التذييل ضعيف المقروئية فوق خلفيته حتى بعد الاشتقاق الآلي',
  )
  return warnings
}
