"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface ToastState {
  toasts: Array<{
    id: string;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message?: string;
    duration?: number;
  }>;
}

type ToastAction =
  | { type: "ADD_TOAST"; payload: Omit<ToastState["toasts"][0], "id"> }
  | { type: "REMOVE_TOAST"; payload: { id: string } };

const ToastContext = createContext<{
  state: ToastState;
  dispatch: React.Dispatch<ToastAction>;
} | null>(null);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      const newToast = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
      };
      return {
        ...state,
        toasts: [...state.toasts, newToast],
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload.id),
      };
    default:
      return state;
  }
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  return (
    <ToastContext.Provider value={{ state, dispatch }}>
      {children}
      <ToastContainer toasts={state.toasts} dispatch={dispatch} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: ToastState["toasts"];
  dispatch: React.Dispatch<ToastAction>;
}> = ({ toasts, dispatch }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={(id) => dispatch({ type: "REMOVE_TOAST", payload: { id } })}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastState["toasts"][0];
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg shadow-lg transition-all duration-300 transform ${getToastStyles()}`}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-current text-white text-xs font-bold">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm mt-1 opacity-90">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full hover:bg-current hover:bg-opacity-20 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { dispatch } = context;

  return {
    success: (title: string, message?: string, duration?: number) => {
      dispatch({
        type: "ADD_TOAST",
        payload: { type: "success", title, message, duration },
      });
    },
    error: (title: string, message?: string, duration?: number) => {
      dispatch({
        type: "ADD_TOAST",
        payload: { type: "error", title, message, duration },
      });
    },
    warning: (title: string, message?: string, duration?: number) => {
      dispatch({
        type: "ADD_TOAST",
        payload: { type: "warning", title, message, duration },
      });
    },
    info: (title: string, message?: string, duration?: number) => {
      dispatch({
        type: "ADD_TOAST",
        payload: { type: "info", title, message, duration },
      });
    },
  };
};

