import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, X } from 'lucide-react';

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
  const [loadError, setLoadError] = useState(false);

  const openWebchat = useCallback(() => {
    try {
      window.botpress?.open();
    } catch {
      // ignore
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

    loadBotpressScripts().catch(() => {
      if (!cancelled) setLoadError(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleClick() {
    if (loadError) return;
    if (open) {
      closeWebchat();
      setOpen(false);
    } else {
      openWebchat();
      setOpen(true);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <button
        onClick={handleClick}
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
  );
}
