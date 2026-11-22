import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function checkAvailability() {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/foodloop-chat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ message: 'hello' }),
      });
      if (res.ok) {
        setConnected(true);
        setConfigError(null);
        return true;
      }
      if (res.status === 503) {
        setConnected(false);
        setConfigError('The AI assistant is not configured yet. An API key needs to be added on the server side to enable real AI responses.');
        return false;
      }
      setConnected(false);
      setConfigError('The AI assistant could not be reached. Please try again later.');
      return false;
    } catch {
      setConnected(false);
      setConfigError('Could not connect to the AI assistant. Please check your connection.');
      return false;
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    if (connected === null) {
      const available = await checkAvailability();
      if (!available) {
        setLoading(false);
        return;
      }
    } else if (connected === false) {
      setLoading(false);
      return;
    }

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/foodloop-chat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) {
        if (res.status === 503) {
          setConnected(false);
          setConfigError('The AI assistant is not configured yet. An API key needs to be added on the server side to enable real AI responses.');
        } else {
          throw new Error(`Request failed (${res.status})`);
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.reply || typeof data.reply !== 'string') {
        throw new Error('Unexpected response format');
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not process your request right now. Please try again later.',
      }]);
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-forest-600 text-white shadow-premium-lg hover:bg-forest-700 transition-all hover:scale-105 flex items-center justify-center"
        title="Ask FoodLoop AI"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-96 card shadow-premium-lg flex flex-col animate-scale-in" style={{ maxHeight: '70vh' }}>
          <div className="p-4 border-b border-cream-200 bg-cream-50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent-600" />
              <div>
                <h3 className="font-semibold text-forest-900 text-sm">FoodLoop Assistant</h3>
                <p className="text-xs text-forest-500">Ask about food safety, listings, or how the platform works</p>
              </div>
            </div>
          </div>

          {configError && (
            <div className="p-3 bg-accent-50 border-b border-accent-100 flex items-start gap-2">
              <AlertCircle size={16} className="text-accent-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-accent-800">{configError}</p>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {messages.length === 0 && !configError && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-accent-500" />
                </div>
                <p className="text-sm text-forest-600 mb-1">Hi! I'm the FoodLoop assistant.</p>
                <p className="text-xs text-forest-500">Ask me anything about food safety, donating, or requesting food.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-forest-600 text-white'
                    : 'bg-cream-100 text-forest-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-cream-100 rounded-xl px-3 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-cream-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
                className="input text-sm"
                placeholder="Type your question..."
              />
              <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-primary px-3 py-2.5">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
