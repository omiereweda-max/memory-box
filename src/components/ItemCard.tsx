import { FileText, Image as ImageIcon, FileType2 } from 'lucide-react';
import type { MemoryItem } from '@/types';
import { formatRelativeTime, formatFileSize } from '@/lib/format';
import { useObjectUrl } from '@/hooks/useObjectUrl';

interface ItemCardProps {
  item: MemoryItem;
  onOpen: (item: MemoryItem) => void;
}

export function ItemCard({ item, onOpen }: ItemCardProps) {
  const isImage = item.type === 'file' && item.mimeType?.startsWith('image/');
  const objectUrl = useObjectUrl(isImage ? item.data : undefined);

  return (
    <button
      onClick={() => onOpen(item)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-right shadow-sm transition-all hover:shadow-lg hover:shadow-stone-200/50 hover:border-emerald-300 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-800 dark:hover:border-emerald-700 dark:hover:shadow-black/20"
    >
      <div className="relative h-40 w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
        {isImage && objectUrl ? (
          <img
            src={objectUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300 dark:text-stone-600">
            {item.type === 'note' ? (
              <FileText className="h-14 w-14" strokeWidth={1.4} />
            ) : item.mimeType === 'application/pdf' ? (
              <FileType2 className="h-14 w-14" strokeWidth={1.4} />
            ) : (
              <ImageIcon className="h-14 w-14" strokeWidth={1.4} />
            )}
          </div>
        )}
        <span className="absolute top-3 right-3 rounded-lg bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {item.type === 'note' ? 'ملاحظة' : 'ملف'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold leading-snug line-clamp-1 text-stone-900 dark:text-stone-100">
          {item.title}
        </h3>
        {item.type === 'note' && item.content ? (
          <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
            {item.content}
          </p>
        ) : (
          <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-1">
            {item.fileName}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-stone-400 dark:text-stone-500">
          <span>{formatRelativeTime(item.createdAt)}</span>
          {item.type === 'file' && item.fileSize && (
            <>
              <span className="text-stone-300 dark:text-stone-600">·</span>
              <span>{formatFileSize(item.fileSize)}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
