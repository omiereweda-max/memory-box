import { Boxes } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-up">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400">
        <Boxes className="h-12 w-12" strokeWidth={1.6} />
      </div>
      <h3 className="mt-6 text-xl font-bold">صندوقك فارغ</h3>
      <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
        ابدأ بإضافة ملف أو ملاحظة لتظهر هنا. كل ما تضيفه يبقى محفوظًا على جهازك فقط.
      </p>
    </div>
  );
}
