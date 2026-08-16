import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'
import { Textarea } from './Textarea'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  /** جملة الأثر المحددة بالأسماء الفعلية — «سيُرجع الإلغاء الكميات للمخزون تلقائياً» */
  impact: string
  /** بصيغة الفعل («إلغاء الطلب»، «حظر وإزالة») — لا «تأكيد» */
  confirmLabel: string
  cancelLabel?: string
  /** سبب إلزامي (الرفض، الحظر…) — زر التنفيذ معطّل حتى تعبئته */
  requireReason?: boolean
  reasonLabel?: string
  loading?: boolean
  onConfirm: (reason?: string) => void
  onCancel: () => void
}

/**
 * نمط التأكيد المدمر الملزم (P10): شرح الأثر + سبب إلزامي عند النص عليه +
 * زر خطر بصيغة الفعل + التركيز الابتدائي على «تراجع» + لا إغلاق بنقر الخلفية.
 */
export function ConfirmDialog({
  open,
  title,
  impact,
  confirmLabel,
  cancelLabel = 'تراجع',
  requireReason = false,
  reasonLabel = 'السبب',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!open) setReason('')
  }, [open])

  const reasonMissing = requireReason && reason.trim() === ''

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      dismissOnBackdrop={false}
      hideCloseButton
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button
            variant="danger"
            disabled={reasonMissing}
            loading={loading}
            onClick={() => onConfirm(requireReason ? reason.trim() : undefined)}
          >
            {confirmLabel}
          </Button>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
        <p>{impact}</p>
        {requireReason && (
          <Textarea
            label={reasonLabel}
            helperText="سيظهر السبب للطرف المعني"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        )}
      </div>
    </Modal>
  )
}
