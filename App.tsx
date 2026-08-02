import { useMemo, useState } from 'react';
import { Plus, Search as SearchIcon, AlertCircle } from 'lucide-react';
import { Header, type Page } from '@/components/Header';
import { AIChat } from '@/components/AIChat';
import { SearchBar } from '@/components/SearchBar';
import { ItemCard } from '@/components/ItemCard';
import { AddModal } from '@/components/AddModal';
import { DetailModal } from '@/components/DetailModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useItems } from '@/hooks/useItems';
import type { MemoryItem } from '@/types';

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const { theme, toggle } = useTheme();
  const { items, loading, error, add, remove } = useItems();

  const [page, setPage] = useState<Page>('library');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<MemoryItem | null>(null);
  const [toDelete, setToDelete] = useState<MemoryItem | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = [
        item.title,
        item.fileName ?? '',
        item.content ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const handleAddNote = async (title: string, content: string) => {
    await add({
      id: generateId(),
      type: 'note',
      title,
      content,
      createdAt: Date.now(),
    });
  };

  const handleAddFile = async (file: File, title: string) => {
    await add({
      id: generateId(),
      type: 'file',
      title,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      data: file,
      createdAt: Date.now(),
    });
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    await remove(toDelete.id);
    setSelected(null);
    setToDelete(null);
  };

  const showEmpty = !loading && items.length === 0;
  const showNoResults = !loading && items.length > 0 && filtered.length === 0;

  return (
    <div className="min-h-screen">
      <Header theme={theme} onToggleTheme={toggle} page={page} onPageChange={setPage} />

      {page === 'chat' && <AIChat />}

      {page === 'library' && (
      <>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-bold sm:text-3xl">كل ما تريد تذكّره في مكان واحد</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">
            احفظ ملفاتك وملاحظاتك على جهازك، وارجع إليها وقت ما تحتاجها.
          </p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
            إضافة شيء جديد
          </button>
        </section>

        {!showEmpty && (
          <div className="mb-8 max-w-2xl mx-auto">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        )}

        {error && (
          <div className="mx-auto mb-6 flex max-w-2xl items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="h-40 w-full animate-pulse bg-stone-100 dark:bg-stone-900" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-stone-100 dark:bg-stone-900" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100 dark:bg-stone-900" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !showEmpty && filtered.length > 0 && (
          <>
            <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
              {filtered.length === 1
                ? 'عنصر واحد'
                : `${filtered.length} عنصر`}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} onOpen={setSelected} />
              ))}
            </div>
          </>
        )}

        {showNoResults && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-600">
              <SearchIcon className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-semibold">لا توجد نتائج</h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              جرّب كلمات بحث مختلفة
            </p>
          </div>
        )}

        {showEmpty && <EmptyState />}
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400 dark:border-stone-800 dark:text-stone-600">
        MemoryBox · تُحفظ بياناتك على جهازك فقط
      </footer>
      </>
      )}

      <AddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAddNote={handleAddNote}
        onAddFile={handleAddFile}
      />
      <DetailModal
        item={selected}
        onClose={() => setSelected(null)}
        onDelete={(item) => setToDelete(item)}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="حذف العنصر؟"
        message="سيُحذف هذا العنصر نهائيًا ولا يمكن استرجاعه."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
