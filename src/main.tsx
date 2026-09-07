import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

console.log('[CoffeeNote] main.tsx initializing...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
  console.log('[CoffeeNote] React root mounted successfully');
} catch (err) {
  console.error('[CoffeeNote] Render error:', err);
  const displayFn = (window as unknown as { displayError?: (title: string, err: unknown) => void }).displayError;
  if (typeof displayFn === 'function') {
    displayFn('アプリの起動エラー', err);
  } else {
    rootElement.innerHTML = `
      <div style="font-family: sans-serif; padding: 24px; text-align: center; background: #fefce8; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 36px; margin-bottom: 12px;">☕</div>
        <h2 style="font-size: 18px; color: #78350f; font-weight: bold; margin-bottom: 8px;">アプリの起動エラー</h2>
        <pre style="font-size: 11px; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #fed7aa; max-width: 90%; overflow: auto; text-align: left; margin-bottom: 16px;">${err instanceof Error ? err.stack || err.message : String(err)}</pre>
        <button onclick="localStorage.clear(); location.replace(location.pathname + '?r=' + Date.now());" style="background: #d97706; color: #fff; border: none; padding: 10px 24px; border-radius: 12px; font-weight: bold; cursor: pointer;">再起動</button>
      </div>
    `;
  }
}

