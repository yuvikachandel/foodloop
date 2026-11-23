import { useEffect } from 'react';

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
  useEffect(() => {
    loadBotpressScripts().catch(() => {
      // Botpress failed to load — the default button simply won't appear
    });
  }, []);

  return null;
}
