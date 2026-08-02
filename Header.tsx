import { Moon, Sun, Boxes, MessageSquare } from 'lucide-react';

export type Page = 'library' | 'chat';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  page: Page;
  onPageChange: (page: Page) => void;
}

export function Header({ theme, onToggleTheme, page, onPageChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Boxes className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">MemoryBox</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">صندوق الذاكرة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1 dark:border-stone-700 dark:bg-stone-800/50">
            <button
              onClick={() => onPageChange('library')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                page === 'library'
                  ? 'bg-white text-emerald-700 shadow-sm dark:bg-stone-700 dark:text-emerald-400'
                  : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <Boxes className="h-4 w-4" />
              <span className="hidden sm:inline">المكتبة</span>
            </button>
            <button
              onClick={() => onPageChange('chat')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                page === 'chat'
                  ? 'bg-white text-emerald-700 shadow-sm dark:bg-stone-700 dark:text-emerald-400'
                  : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">المساعد الذكي</span>
            </button>
          </nav>

          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
