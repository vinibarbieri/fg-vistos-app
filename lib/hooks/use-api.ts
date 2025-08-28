import { useState, useCallback } from "react";
import { ApiResponse } from "../api-service";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  initialData: T | null = null
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);

        if (response.error) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.error,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            data: response.data || null,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        }));
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

// Hook específico para operações CRUD
export function useCrudApi<T = any>(apiService: {
  get: (...args: any[]) => Promise<ApiResponse<T[]>>;
  create: (data: Partial<T>) => Promise<ApiResponse<T>>;
  update: (id: string, data: Partial<T>) => Promise<ApiResponse<T>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.get(...args);

        if (response.error) {
          setError(response.error);
        } else {
          setData(response.data || []);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    },
    [apiService]
  );

  const createItem = useCallback(
    async (itemData: Partial<T>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.create(itemData);

        if (response.error) {
          setError(response.error);
          return null;
        } else {
          setData((prev) => [response.data!, ...prev]);
          return response.data;
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiService]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<T>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.update(id, updates);

        if (response.error) {
          setError(response.error);
          return null;
        } else {
          setData((prev) =>
            prev.map((item) =>
              (item as any).id === id ? { ...item, ...updates } : item
            )
          );
          return response.data;
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiService]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.delete(id);

        if (response.error) {
          setError(response.error);
          return false;
        } else {
          setData((prev) => prev.filter((item) => (item as any).id !== id));
          return true;
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiService]
  );

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    reset,
    setData,
  };
}

