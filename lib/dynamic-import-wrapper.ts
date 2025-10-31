/**
 * Utility functions for handling dynamic imports with better error handling
 */

/**
 * Wrapper for dynamic imports that provides better error handling for chunk loading errors
 */
export async function safeDynamicImport<T>(importFn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: any = null
  
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn()
    } catch (error: any) {
      lastError = error
      
      // Check if this is a chunk loading error
      const isChunkError = error?.name === 'ChunkLoadError' || 
        error?.message?.includes('ChunkLoadError') ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('load chunk')
      
      if (isChunkError) {
        console.warn(`ChunkLoadError attempt ${i + 1}/${retries}:`, error)
        
        // For chunk errors, we might want to refresh the page instead of retrying
        if (typeof window !== 'undefined') {
          // On the last retry, prompt for refresh
          if (i === retries - 1) {
            const shouldRefresh = confirm(
              'The application needs to refresh to load the latest updates. Click OK to refresh the page.'
            )
            
            if (shouldRefresh) {
              window.location.reload()
              // This might not execute if the page reloads, but it's good to have
              break
            }
          } else {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
          }
        }
      } else {
        // For non-chunk errors, re-throw immediately
        throw error
      }
    }
  }
  
  // If we've exhausted retries, throw the last error
  throw lastError
}

/**
 * Creates a dynamic import with automatic chunk error handling
 */
export function createSafeDynamicImport<T>(
  importFn: () => Promise<T>, 
  options: { retries?: number; ssr?: boolean } = {}
) {
  const { retries = 3, ssr = true } = options
  
  return async () => {
    return safeDynamicImport(importFn, retries)
  }
}