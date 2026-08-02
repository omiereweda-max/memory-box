import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { getItemSummaries } from '@/db/database';
import { searchMemory } from '@/lib/search';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const WORKER_URL =
  import.meta.env.VITE_WORKER_URL || 'https://red-cherry-2ca0.osaideweda.workers.dev/';

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: question,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const summaries = await getItemSummaries();
      const context = searchMemory(summaries, question);

      const payload: Record<string, unknown> = { question };
      if (context.length > 0) {
        payload.context = context;
        payload.hasMemoryContext = true;
      } else {
        payload.hasMemoryContext = false;
      }

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let serverMsg = '';
        try {
          const errData = await res.json();
          serverMsg = errData?.error || '';
        } catch {
          /* response body wasn't JSON */
        }
        throw new Error(
          `الخادم رد بحالة خطأ ${res.status}${serverMsg ? `: ${serverMsg}` : ''}`,
        );
      }

      const data = await res.json();

      if (data.success === false) {
        throw new Error(data.error || 'حدث خطأ في الخادم');
      }

      const answer: string =
        data.answer ??
        data.response ??
        data.message ??
        data.result ??
        data.reply ??
        (typeof data === 'string' ? data : '');

      if (!answer) {
        throw new Error('لم يصل رد من المساعد');
      }

      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content: answer },
      ]);
    } catch (err) {
      let message: string;
      if (err instanceof TypeError) {
        const hint = err.message.toLowerCase();
        if (hint.includes('failed to fetch') || hint.includes('load failed')) {
          message =
            'تعذّر الوصول إلى الخادم. الأسباب المحتملة:\n' +
            '• المشكلة الأكثر شيوعًا: الخادم لا يُرجع رؤوس CORS، ما يجعل المتصفح يحظر الاستجابة.\n' +
            '• انقطاع الاتصال بالإنترنت.\n' +
            '• عنوان الخادم غير صحيح.';
        } else {
          message = `خطأ في الشبكة: ${err.message}`;
        }
      } else if (err instanceof Error) {
        message = err.message;
      } else {
        message = 'حدث خطأ غير متوقع';
      }
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content: message, error: true },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem-1px)] max-w-3xl flex-col px-4 sm:px-6">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <MessageSquare className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">المساعد الذكي</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              اسأل عن ملاحظاتك وملفاتك
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">محادثة جديدة</span>
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800/50"
      >
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400">
              <MessageSquare className="h-10 w-10" strokeWidth={1.6} />
            </div>
            <h3 className="mt-5 text-lg font-bold">ابدأ محادثة</h3>
            <p className="mt-2 max-w-xs text-sm text-stone-500 dark:text-stone-400">
              اكتب سؤالك في الأسفل وسيرد عليك المساعد الذكي.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-emerald-600 text-white'
                      : msg.error
                        ? 'rounded-tl-sm border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400'
                        : 'rounded-tl-sm border border-stone-200 bg-stone-50 text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
                  <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    يفكّر…
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="py-4">
        <div className="relative flex items-end gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm transition-colors focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/30 dark:border-stone-700 dark:bg-stone-800">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب سؤالك هنا…"
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none dark:text-stone-100 dark:placeholder:text-stone-500"
            style={{ minHeight: '40px' }}
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            aria-label="إرسال"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition-all hover:bg-emerald-700 active:scale-90 disabled:opacity-40 disabled:hover:bg-emerald-600"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" style={{ transform: 'scaleX(-1)' }} />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-stone-400 dark:text-stone-600">
          اضغط Enter للإرسال · Shift+Enter لسطر جديد
        </p>
      </div>
    </div>
  );
}
