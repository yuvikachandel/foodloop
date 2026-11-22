import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Minus } from 'lucide-react';

const INJECT_SCRIPT_URL = 'https://cdn.botpress.cloud/webchat/v5.0/inject.js';
const CONFIG_SCRIPT_URL = 'https://files.bpcontent.cloud/2026/11/22/12/20261122122236-7UTB7E09.js';

declare global {
  interface Window {
    botpress?: {
      init: (config: Record<string, unknown>) => void;
      open: () => void;
      close: () => void;
      toggle: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

let scriptsLoading: Promise<void> | null = null;

function loadScript(src: string, defer = false): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => {
        existing.setAttribute('data-loaded', 'true');
        resolve();
      });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (defer) script.defer = true;
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function loadBotpressScripts(): Promise<void> {
  if (scriptsLoading) return scriptsLoading;
  if (window.botpress) return Promise.resolve();

  scriptsLoading = loadScript(INJECT_SCRIPT_URL)
    .then(() => loadScript(CONFIG_SCRIPT_URL, true));

  return scriptsLoading;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const initRef = useRef(false);

  const openWebchat = useCallback(() => {
    try {
      window.botpress?.open();
    } catch {
      // ignore — window may not be ready
    }
  }, []);

  const closeWebchat = useCallback(() => {
    try {
      window.botpress?.close();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadBotpressScripts()
      .then(() => {
        if (cancelled || initRef.current) return;
        initRef.current = true;

        // The config bundle script calls window.botpress.init() with the
        // Client ID and bot configuration. We just listen for readiness.
        window.botpress?.on('webchat:initialized', () => {
          if (!cancelled) setReady(true);
        });

        // Fallback: if the event already fired before our listener attached,
        // mark ready after a short delay if botpress is present.
        setTimeout(() => {
          if (!cancelled && window.botpress && !ready) setReady(true);
        }, 3000);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  function handleToggle() {
    if (loadError) return;
    if (open) {
      closeWebchat();
      setOpen(false);
    } else {
      openWebchat();
      setOpen(true);
    }
  }

  function handleMinimize() {
    closeWebchat();
    setOpen(false);
  }

  return (
    <>
      {/* Custom FoodLoop-branded launcher — sits above Botpress's default FAB which is hidden via CSS */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2">
        {open && (
          <button
            onClick={handleMinimize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-forest-700 text-xs font-semibold shadow-premium border border-cream-200 hover:bg-cream-50 transition-colors animate-fade-in"
            title="Minimize chat"
          >
            <Minus size={14} />
            Minimize
          </button>
        )}

        <button
          onClick={handleToggle}
          disabled={loadError}
          className="group flex items-center gap-2 pl-4 pr-5 h-14 rounded-full bg-forest-600 text-white shadow-premium-lg hover:bg-forest-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ask FoodLoop"
          aria-label="Ask FoodLoop"
        >
          {open ? (
            <X size={22} className="flex-shrink-0" />
          ) : (
            <MessageCircle size={22} className="flex-shrink-0" />
          )}
          <span className="text-sm font-semibold whitespace-nowrap">
            {open ? 'Close' : 'Ask FoodLoop'}
          </span>
        </button>
      </div>

      {/* Status / error indicator shown while the Botpress webchat loads */}
      {open && !ready && !loadError && (
        <div className="fixed bottom-24 right-6 z-[55] w-[calc(100vw-3rem)] sm:w-96 card shadow-premium-lg p-6 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-forest-200 border-t-forest-600 rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm text-forest-700">Connecting to FoodLoop Assistant...</p>
          </div>
        </div>
      )}

      {open && loadError && (
        <div className="fixed bottom-24 right-6 z-[55] w-[calc(100vw-3rem)] sm:w-96 card shadow-premium-lg p-6 animate-scale-in">
          <p className="text-sm text-forest-700 mb-2">
            The chatbot could not be loaded right now.
          </p>
          <p className="text-xs text-forest-500">
            Make sure you are connected to the internet and try again. If the problem
            persists, verify your bot is published in the Botpress Dashboard.
          </p>
        </div>
      )}
    </>
  );
}
