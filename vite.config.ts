import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    'process.env': process.env,
    global: 'globalThis'
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['react-hot-toast'],
          
          // Firebase chunks
          'firebase-core': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-db': ['firebase/firestore'],
          
          // Feature chunks
          'feature-auth': [
            './src/context/AuthContext.tsx',
            './src/pages/Login.tsx',
            './src/pages/SignUp.tsx',
            './src/pages/VerifyEmail.tsx'
          ],
          'feature-profile': [
            './src/context/ProfileContext.tsx',
            './src/pages/Profile.tsx',
            './src/pages/ProfileEdit.tsx'
          ],
          'feature-workouts': [
            './src/pages/Workouts.tsx',
            './src/pages/Progress.tsx'
          ],
          'feature-diet': [
            './src/pages/DietPlan.tsx',
            './src/pages/DietPlanDetails.tsx'
          ]
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  },
  server: {
    open: true,
    port: 3000
  }
});
