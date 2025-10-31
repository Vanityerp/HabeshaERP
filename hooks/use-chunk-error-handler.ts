'use client'

import { useEffect } from 'react'

/**
 * Hook to handle ChunkLoadError specifically
 * This hook will listen for chunk loading errors and provide a better user experience
 */
export function useChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (error: ErrorEvent) => {
      // Check if this is a chunk loading error
      if (
        error.error?.name === 'ChunkLoadError' || 
        error.message?.includes('ChunkLoadError') ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('load chunk')
      ) {
        console.warn('ChunkLoadError detected:', error)
        
        // Show a user-friendly message
        if (typeof window !== 'undefined') {
          const shouldRefresh = window.confirm(
            'The application needs to refresh to load the latest updates. Click OK to refresh the page.'
          )
          
          if (shouldRefresh) {
            // Force a hard refresh to clear cache and reload all resources
            window.location.reload()
          }
        }
      }
    }

    // Listen for unhandled errors
    window.addEventListener('error', handleChunkError)
    
    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkError)
    }
  }, [])
}

/**
 * Function to manually handle chunk errors
 * Can be called when dynamically importing modules
 */
export async function handleDynamicImport<T>(importFn: () => Promise<T>): Promise<T> {
  try {
    return await importFn()
  } catch (error: any) {
    // Check if this is a chunk loading error
    if (
      error?.name === 'ChunkLoadError' || 
      error?.message?.includes('ChunkLoadError') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('load chunk')
    ) {
      console.warn('ChunkLoadError during dynamic import:', error)
      
      // Show user-friendly message and refresh
      if (typeof window !== 'undefined') {
        const shouldRefresh = window.confirm(
          'The application needs to refresh to load the latest updates. Click OK to refresh the page.'
        )
        
        if (shouldRefresh) {
          window.location.reload()
        }
      }
    }
    
    // Re-throw the error for other error boundaries to handle
    throw error
  }
}