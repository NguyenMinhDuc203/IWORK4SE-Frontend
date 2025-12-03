"use client"

import * as React from "react"

export type ToastProps = {
  id?: string
  title?: string
  action?: string
  description?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type Action =
  | { type: "ADD_TOAST"; toast: ToastProps }
  | { type: "UPDATE_TOAST"; toast: Partial<ToastProps> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

let idCounter = 0
function generateId() {
  idCounter++
  return idCounter.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const listeners: ((state: ToastProps[]) => void)[] = []
let memoryState: ToastProps[] = []

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

function reducer(state: ToastProps[], action: Action): ToastProps[] {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast, ...state].slice(0, TOAST_LIMIT)

    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      )

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) scheduleRemoval(toastId)
      else state.forEach((t) => scheduleRemoval(t.id!))

      return state.map((t) =>
        t.id === toastId || toastId === undefined ? { ...t, open: false } : t
      )
    }

    case "REMOVE_TOAST":
      if (!action.toastId) return []
      return state.filter((t) => t.id !== action.toastId)

    default:
      return state
  }
}

function scheduleRemoval(toastId: string) {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export function useToast() {
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx >= 0) listeners.splice(idx, 1)
    }
  }, [])

  const toast = React.useCallback((props: ToastProps) => {
    const id = generateId()

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dispatch({ type: "DISMISS_TOAST", toastId: id })
        },
      },
    })

    return {
      dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
      update: (props: Partial<ToastProps>) =>
        dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } }),
    }
  }, [])

  return {
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
    toasts: state,
  }
}
