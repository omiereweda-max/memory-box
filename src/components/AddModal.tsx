import { useEffect } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';

interface AddModalProps {
  open: boolean;
  onClose: () => void;
  onAddNote: (title: string, content: string) => Promise<void>;
  onAddFile: (file: File, title: string) => Promise<void>;
}

import { useState } from 'react';

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export function AddModal({ open, onClose, onAddNote, onAddFile }: AddModalProps) {
  const [mode, setMode] = useState<'choose' | 'note' | 'file'>('choose');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setMode('choose');
      setTitle('');
      setContent('');
      setFile(null);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const reset = () => {
    setMode('choose');
    setTitle('');
    setContent('');
    setFile(null);
    setError(null);
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      setError('حجم الملف كبير جدًا. الحد الأقصى ١٥ ميجابايت.');
      return;
    }
    setFile(selected);
    if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ''));
    setError(null);
  };

  const submitNote = async () => {
    if (!title.trim()) {
      setError('الرجاء إدخال عنوان للملاحظة');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onAddNote(title.trim(), content.trim());
      close();
    } catch {
      setError('تعذّر حفظ الملاحظة');
    } finally {
      setSaving(false);
    }
  };

  const submitFile = async () => {
    if (!file) {
      setError('الرجاء اختيار ملف');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onAddFile(file, title.trim() || file.name);
      close();
    } catch {
      setError('تعذّر حفظ الملف');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 animate-fade-in sm:items-center sm:p-4"
      onClick={close}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white shadow-2xl animate-slide-up dark:bg-stone-800 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 p-5 dark:border-stone-700">
          <h2 className="text-lg font-bold">إضافة شيء جديد</h2>
          <button
            onClick={close}
            disabled={saving}
            aria-label="إغلاق"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 disabled:opacity-50 dark:hover:bg-stone-700 dark:hover:text-stone-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {mode === 'choose' && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <button
                onClick={() => setMode('file')}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-stone-200 p-6 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50 active:scale-95 dark:border-stone-700 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-semibold">رفع ملف</p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">صور أو PDF</p>
                </div>
              </button>
              <button
                onClick={() => setMode('note')}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-stone-200 p-6 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50 active:scale-95 dark:border-stone-700 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-semibold">كتابة ملاحظة</p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">نص سريع</p>
                </div>
              </button>
            </div>
          )}

          {mode === 'note' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                  عنوان الملاحظة
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: أفكار لمشروع جديد"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                  المحتوى
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب ملاحظتك هنا…"
                  rows={5}
                  className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <button
                onClick={submitNote}
                disabled={saving}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'جارٍ الحفظ…' : 'حفظ الملاحظة'}
              </button>
            </div>
          )}

          {mode === 'file' && (
            <div className="space-y-4 animate-fade-in">
              <label className="block">
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                    file
                      ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20'
                      : 'border-stone-300 hover:border-emerald-400 dark:border-stone-600 dark:hover:border-emerald-600'
                  }`}
                >
                  {file ? (
                    <>
                      <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        انقر لاختيار ملف آخر
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-stone-400" />
                      <p className="mt-2 text-sm font-medium text-stone-600 dark:text-stone-300">
                        انقر لاختيار ملف
                      </p>
                      <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                        صور (JPG, PNG) أو PDF — حتى ١٥ ميجابايت
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <div className="animate-fade-in">
                  <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                    عنوان الملف
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="اسم وصفي للملف"
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <button
                onClick={submitFile}
                disabled={saving || !file}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ الحفظ…
                  </>
                ) : (
                  'حفظ الملف'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
