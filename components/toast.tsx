"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Aguarda a animação terminar
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icon = type === "success" ? (
    <CheckCircle className="h-5 w-5 text-primary" />
  ) : (
    <XCircle className="h-5 w-5 text-destructive" />
  );

  const bgColor = type === "success" ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20";

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${bgColor}`}>
        {icon}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Hook para gerenciar toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: "success" | "error";
  }>>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, showToast, removeToast };
} 