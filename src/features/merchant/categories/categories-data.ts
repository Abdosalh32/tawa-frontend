/**
 * بيانات وأنواع شاشة «التصنيفات» — محلية بالكامل، لا حفظ فعلياً.
 *
 * **مطابقة لعقد الباكند** (`categories` · `CategoryRequest` · `CategoryResource`):
 * - الحقول: `name` (إلزامي ≤255) · `description` (اختياري ≤1000) ·
 *   `parent_id` (اختياري — شجرة) · `is_active` (افتراضيه true).
 * - **الـ slug يولّده الخادم** من الاسم (`Str::slug`، فريد لكل متجر بلاحقة عند التصادم؛
 *   الاسم العربي الصرف يُنتج `cat-<timestamp>`) — لا حقل slug في النموذج.
 * - المسارات: GET/POST `/stores/{id}/categories` · PUT/DELETE `/stores/{id}/categories/{id}`
 *   — CRUD كامل، **التعديل موجود** (خلافاً للخصومات).
 * - الحذف soft-delete للتصنيف المختار وحده — **الفروع لا تُحذف معه** (يبقى ربطها
 *   بأب محذوف: سلوك خلفي يُعرض كما هو ولا نخترع غيره).
 * - العمق: المخطط يسمح بأي عمق، والواجهة تقيد الاختيار بمستويين
 *   (رئيسي ← فرعي) وفق الشجرة الموثقة في جرد المكونات §3.
 */

export interface MerchantCategory {
  id: string
  name: string
  /** يولّده الخادم — للعرض فقط */
  slug: string
  description: string
  parentId: string | null
  isActive: boolean
  createdAt: string
}

/**
 * تصنيفات «متجر العافية» التجريبية — متسقة مع تبويبات ستورفرونت الزبون
 * (العناية الشخصية · أزياء · عطور · منزل وديكور) مع فروع لبعضها.
 */
export const MERCHANT_CATEGORIES: readonly MerchantCategory[] = [
  {
    id: 'cat-1',
    name: 'العناية الشخصية',
    slug: 'personal-care',
    description: 'شامبو، كريمات، وزيوت طبيعية للعناية اليومية.',
    parentId: null,
    isActive: true,
    createdAt: '12 أغسطس 2026',
  },
  {
    id: 'cat-5',
    name: 'العناية بالشعر',
    slug: 'hair-care',
    description: '',
    parentId: 'cat-1',
    isActive: true,
    createdAt: '13 أغسطس 2026',
  },
  {
    id: 'cat-6',
    name: 'العناية بالبشرة',
    slug: 'skin-care',
    description: 'كريمات ومرطبات البشرة.',
    parentId: 'cat-1',
    isActive: true,
    createdAt: '13 أغسطس 2026',
  },
  {
    id: 'cat-2',
    name: 'أزياء',
    slug: 'fashion',
    description: 'ملابس رجالية ونسائية.',
    parentId: null,
    isActive: true,
    createdAt: '12 أغسطس 2026',
  },
  {
    id: 'cat-3',
    name: 'عطور',
    slug: 'perfumes',
    description: 'عطور شرقية وغربية بتراكيز متعددة.',
    parentId: null,
    isActive: true,
    createdAt: '12 أغسطس 2026',
  },
  {
    id: 'cat-4',
    name: 'منزل وديكور',
    slug: 'cat-1755012345',
    description: 'إكسسوارات منزلية بسيطة.',
    parentId: null,
    isActive: false,
    createdAt: '14 أغسطس 2026',
  },
]

/** ترتيب العرض الشجري: كل رئيسي يتبعه فروعه مباشرة */
export function treeOrder(categories: readonly MerchantCategory[]): MerchantCategory[] {
  const roots = categories.filter((category) => category.parentId === null)
  return roots.flatMap((root) => [root, ...categories.filter((category) => category.parentId === root.id)])
}

/** عدد فروع تصنيف رئيسي */
export function childCountOf(categories: readonly MerchantCategory[], id: string): number {
  return categories.filter((category) => category.parentId === id).length
}

export interface CategoryDraft {
  name: string
  description: string
  parentId: string | null
  isActive: boolean
}

export const EMPTY_DRAFT: CategoryDraft = { name: '', description: '', parentId: null, isActive: true }

export interface CategoryDraftErrors {
  name?: string
  description?: string
}

/** تحقق محلي يطابق قواعد `CategoryRequest` */
export function validateCategoryDraft(draft: CategoryDraft): CategoryDraftErrors {
  const errors: CategoryDraftErrors = {}
  if (draft.name.trim() === '') {
    errors.name = 'اسم التصنيف مطلوب — يظهر لزبائنك في واجهة المتجر'
  } else if (draft.name.trim().length > 255) {
    errors.name = 'الحد الأقصى لاسم التصنيف 255 حرفاً'
  }
  if (draft.description.length > 1000) {
    errors.description = 'الحد الأقصى للوصف 1000 حرف'
  }
  return errors
}

/**
 * محاكاة محلية لتوليد الخادم للـ slug (`Str::slug`):
 * أحرف لاتينية وأرقام تُفصل بشرطات؛ الاسم العربي الصرف ⇒ `cat-<timestamp>`؛
 * وعند التصادم داخل المتجر تُلحق لاحقة عشوائية.
 */
export function simulateServerSlug(name: string, existing: readonly MerchantCategory[]): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
  let slug = base !== '' && base !== '-' ? base : `cat-${1755400000 + existing.length}`
  if (existing.some((category) => category.slug === slug)) {
    slug += `-${100 + ((existing.length * 37) % 900)}`
  }
  return slug
}
