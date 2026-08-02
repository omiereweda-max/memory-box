import { useCallback, useEffect, useState } from 'react';
import type { MemoryItem } from '@/types';
import { deleteItem, getAllItems, saveItem } from '@/db/database';

export function useItems() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await getAllItems();
        if (active) {
          setItems(all);
          setError(null);
        }
      } catch {
        if (active) setError('تعذّر تحميل البيانات');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback(async (item: MemoryItem) => {
    await saveItem(item);
    setItems((prev) => [item, ...prev]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { items, loading, error, add, remove };
}
