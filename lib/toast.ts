import { toast as sonnerToast } from "sonner"

// Track active toasts to prevent duplicates
const activeToasts = new Map<string, string | number>()

// Helper to generate unique key for toast message
const getToastKey = (message: string, type: string): string => {
  return `${type}:${message}`
}

// Helper to check if toast is already active
const isToastActive = (message: string, type: string): boolean => {
  const key = getToastKey(message, type)
  return activeToasts.has(key)
}

// Helper to register toast
const registerToast = (message: string, type: string, id: string | number): void => {
  const key = getToastKey(message, type)
  activeToasts.set(key, id)

  // Auto-cleanup after 5 seconds (default duration)
  setTimeout(() => {
    activeToasts.delete(key)
  }, 5000)
}

export const showSuccessToast = (message = "Changes applied successfully") => {
  if (isToastActive(message, "success")) {
    return // Prevent duplicate
  }

  const id = sonnerToast.success(message, {
    duration: 5000,
  })

  registerToast(message, "success", id)
}

export const showErrorToast = (message = "Could not apply changes") => {
  if (isToastActive(message, "error")) {
    return // Prevent duplicate
  }

  const id = sonnerToast.error(message, {
    duration: 5000,
  })

  registerToast(message, "error", id)
}

export const showWarningToast = (message = "Entry unpublished") => {
  if (isToastActive(message, "warning")) {
    return // Prevent duplicate
  }

  const id = sonnerToast.warning(message, {
    duration: 5000,
  })

  registerToast(message, "warning", id)
}

export const showInfoToast = (message = "Entry saved") => {
  if (isToastActive(message, "info")) {
    return // Prevent duplicate
  }

  const id = sonnerToast.info(message, {
    duration: 5000,
  })

  registerToast(message, "info", id)
}

// Export the base toast for advanced usage
export { sonnerToast as toast }
