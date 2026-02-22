import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || {}

  // Expose storage utilities in dev mode for easy debugging
  const clearAppStorage = () => {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('auth') || key.includes('project') || key.includes('toast') || key.startsWith('z-'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`[DevTools] Cleared ${keysToRemove.length} storage item(s):`, keysToRemove)
  }

  // Expose to window for easy access
  Object.assign(window, {
    clearAppStorage,
    listStorage: () => {
      console.log('[DevTools] Current localStorage:')
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          console.log(`  ${key}:`, value?.substring(0, 100) + (value && value.length > 100 ? '...' : ''))
        }
      }
    },
  })

  console.log('[DevTools] Storage utilities available: clearAppStorage(), listStorage()')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
