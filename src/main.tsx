import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

function report(msg: string) {
  try {
    const img = new Image();
    img.src = '/api/client-log?msg=' + encodeURIComponent(msg) + '&t=' + Date.now();
  } catch {}
}

report('main.tsx executing');

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    report('main.tsx creating root and rendering App');
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    (window as unknown as { __APP_MOUNTED__?: boolean }).__APP_MOUNTED__ = true;
    report('main.tsx render invoked successfully');
  } catch (err) {
    report('main.tsx error: ' + (err instanceof Error ? err.stack || err.message : String(err)));
  }
} else {
  report('main.tsx: rootElement not found!');
}
