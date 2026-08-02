import { useEffect, useState } from 'react';
import {
  X,
  Trash2,
  Download,
  FileText,
  FileType2,
  Image as ImageIcon,
  Calendar,
  FileArchive,
} from 'lucide-react';
import type { MemoryItem } from '@/types';
import { formatDateTime, formatFileSize } from '@/lib/format';
import { useObjectUrl } from '@/hooks/useObjectUrl';

interface DetailModalProps {
  item: MemoryItem | null;
  onClose: () => void;
  onDelete: (item: MemoryItem) => void;
}

export function DetailModal({ item, onClose, onDelete }: DetailModalProps) {
  const objectUrl = useObjectUrl(
    item?.type === 'file' ? item.data : undefined,
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [item?.id]);

  if (!item) return null;

  const isImage =
    item.type === 'file' &&
    item.mimeType?.startsWith('image/') &&
    !imgError;
  const isPdf = item.type === 'file' && item.mimeType === 'application/pdf';

  const handleDownload = () => {
    if (!objectUrl || !item.data) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = item.fileName || item.title;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up dark:bg-stone-800 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 p-5 dark:border-stone-700">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                item.type === 'note'
                  ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}
            >
              {item.type === 'note' ? (
                <FileText className="h-5 w-5" />
              ) : isPdf ? (
                <FileType2 className="h-5 w-5" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
            </div>
            <h2 className="truncate text-lg font-bold">{item.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {item.type === 'file' && (
            <div className="mb-5 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900">
              {isImage && objectUrl ? (
                <img
                  src={objectUrl}
                  alt={item.title}
                  className="max-h-[50vh] w-full object-contain"
                  onError={() => setImgError(true)}
                />
              ) : isPdf && objectUrl ? (
                <iframe
                  src={objectUrl}
                  title={item.title}
                  className="h-[60vh] w-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-stone-400 dark:text-stone-600">
                  <FileArchive className="h-16 w-16" strokeWidth={1.3} />
                  <p className="mt-3 text-sm">المعاينة غير متاحة</p>
                </div>
              )}
            </div>
          )}

          {item.type === 'note' && item.content ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-900">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                {item.content}
              </p>
            </div>
          ) : item.type === 'note' ? (
            <p className="text-sm text-stone-400">لا يوجد محتوى</p>
          ) : null}

          <div className="mt-5 space-y-3">
            {item.type === 'file' && (
              <>
                <DetailRow label="اسم الملف" value={item.fileName || '—'} />
                <DetailRow
                  label="الحجم"
                  value={item.fileSize ? formatFileSize(item.fileSize) : '—'}
                />
                <DetailRow
                  label="النوع"
                  value={
                    item.mimeType?.startsWith('image/')
                      ? 'صورة'
                      : item.mimeType === 'application/pdf'
                        ? 'PDF'
                        : 'ملف'
                  }
                />
              </>
            )}
            <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              <Calendar className="h-4 w-4 text-stone-400" />
              <span>أُضيف في {formatDateTime(item.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-stone-100 p-5 dark:border-stone-700">
          {item.type === 'file' && objectUrl && (
            <button
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
            >
              <Download className="h-4 w-4" />
              تنزيل
            </button>
          )}
          <button
            onClick={() => onDelete(item)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-500 dark:text-stone-400">{label}</span>
      <span className="font-medium text-stone-800 dark:text-stone-200">{value}</span>
    </div>
  );
}
