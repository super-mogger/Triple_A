import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import './config/firebase';

// Lazy load non-critical components
const App = lazy(() => import('./App'));
const SpeedInsights = lazy(() => import('@vercel/speed-insights/react').then(mod => ({ default: mod.SpeedInsights })));
const Analytics = lazy(() => import('@vercel/analytics/react').then(mod => ({ default: mod.Analytics })));

const container = document.getElementById('root');
const root = createRoot(container!);

// Remove debug logging in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
}

root.render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <App />
          <SpeedInsights />
          <Analytics />
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);