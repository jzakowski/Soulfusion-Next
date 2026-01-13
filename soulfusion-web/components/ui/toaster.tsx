"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useUIStore } from "@/lib/stores/ui-store"

export function Toaster() {
  const { toasts, removeToast } = useUIStore()

  return (
    <ToastProvider>
      <ToastViewport>
        {toasts.map(({ id, message, variant }) => (
          <Toast key={id} variant={variant} onClick={() => removeToast(id)}>
            <div className="grid gap-1">
              {message && <ToastTitle>{variant === 'destructive' ? 'Error' : 'Notification'}</ToastTitle>}
              {message && <ToastDescription>{message}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        ))}
      </ToastViewport>
    </ToastProvider>
  )
}
