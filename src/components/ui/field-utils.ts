/** يبني قيمة aria-describedby المطابقة لما يعرضه غلاف الحقل Field */
export function fieldDescribedBy(id: string, helperText?: string, error?: string): string | undefined {
  if (error) return `${id}-error`
  if (helperText) return `${id}-helper`
  return undefined
}
