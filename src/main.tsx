import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { OdinErrorContext } from "odin-react"
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient();

//Code required to allow the Tanstack Query Dev Tools to function
// This code is only for TypeScript
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__:
    import('@tanstack/query-core').QueryClient
  }
}
// This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <OdinErrorContext>
        <App />
      </OdinErrorContext>
    </QueryClientProvider>
  </StrictMode>,
)
