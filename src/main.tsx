import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import './config/firebase';

// Preload and cache critical routes
const CRITICAL_ROUTES = {
  app: () => import('./App'),
  dashboard: () => import('./pages/Dashboard'),
  diet: () => import('./pages/DietPlan'),
  profile: () => import('./pages/Profile')
};

// Preload critical routes in parallel
Object.values(CRITICAL_ROUTES).forEach(importFn => {
  importFn().then(module => {
    // Cache the module in memory
    (window as any).__ROUTE_CACHE__ = {
      ...(window as any).__ROUTE_CACHE__,
      [module.default.name]: module
    };
  });
});

// Optimized App loading with route prefetching
const App = lazy(() => {
  // Load App and critical routes in parallel
  return Promise.all([
    CRITICAL_ROUTES.app(),
    CRITICAL_ROUTES.dashboard(),
    CRITICAL_ROUTES.diet()
  ]).then(([appModule]) => appModule);
});

// Defer analytics to avoid blocking route transitions
const SpeedInsights = lazy(() => 
  new Promise(resolve => 
    requestIdleCallback(() => 
      import('@vercel/speed-insights/react')
        .then(mod => resolve({ default: mod.SpeedInsights }))
    )
  )
);

const Analytics = lazy(() => 
  new Promise(resolve => 
    requestIdleCallback(() => 
      import('@vercel/analytics/react')
        .then(mod => resolve({ default: mod.Analytics }))
    )
  )
);

// Optimized loading UI with instant feedback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const container = document.getElementById('root');
const root = createRoot(container!);

// Performance optimizations
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

// Memory management
window.addEventListener('beforeunload', () => {
  root.unmount();
  // Clear route cache
  (window as any).__ROUTE_CACHE__ = {};
});

// Link prefetching
const prefetchLinks = () => {
  requestIdleCallback(() => {
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const route = href.split('/')[1];
        if (CRITICAL_ROUTES[route as keyof typeof CRITICAL_ROUTES]) {
          // Prefetch when browser is idle
          CRITICAL_ROUTES[route as keyof typeof CRITICAL_ROUTES]();
        }
      }
    });
  });
};

// Optimized render with route prefetching
root.render(
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <BrowserRouter>
        <App />
        <Suspense fallback={null}>
          <SpeedInsights />
          <Analytics />
        </Suspense>
      </BrowserRouter>
    </Suspense>
  </ErrorBoundary>
);