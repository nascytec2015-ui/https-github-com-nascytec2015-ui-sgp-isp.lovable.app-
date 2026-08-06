import { useEffect, useState } from "react";

type ToastVariant = "default" | "destructive";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastListener = (toast: Toast) => void;

const listeners: ToastListener[] = [];

export function toast(data: Omit<Toast, "id">) {
  const id = crypto.randomUUID();

  const newToast: Toast = {
    id,
    ...data,
  };

  listeners.forEach((listener) => listener(newToast));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener: ToastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
    };

    listeners.push(listener);

    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  return {
    toast,
    toasts,
    dismiss,
  };
}
