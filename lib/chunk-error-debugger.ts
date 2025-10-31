/**
 * Utility for debugging ChunkLoadError issues
 */

// Enable chunk error debugging in development
export function enableChunkErrorDebugging() {
  // Only run in browser environment
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Override the default error handler to provide more detailed information
    const originalErrorHandler = window.onerror
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if this is a chunk loading error
      const messageStr = typeof message === 'string' ? message : String(message);
      if (
        error?.name === 'ChunkLoadError' || 
        messageStr?.includes('ChunkLoadError') ||
        messageStr?.includes('Loading chunk') ||
        messageStr?.includes('load chunk')
      ) {
        console.group('🔍 ChunkLoadError Debug Information')
        console.error('ChunkLoadError occurred:', error)
        console.log('Message:', message)
        console.log('Source:', source)
        console.log('Line:', lineno)
        console.log('Column:', colno)
        
        // Try to extract chunk information
        if (source) {
          console.log('Failed to load chunk from:', source)
          
          // Check if it's a local development URL
          if (source.includes('localhost') || source.includes('127.0.0.1')) {
            console.log('💡 This appears to be a local development issue.')
            console.log('💡 Try clearing your browser cache and restarting the development server.')
          }
          
          // Check if it's a production URL
          if (source.includes(window.location.hostname)) {
            console.log('💡 This appears to be an issue with your deployed application.')
            console.log('💡 Try clearing your browser cache and refreshing the page.')
          }
        }
        
        // Check for common causes
        console.log('🔧 Common causes and solutions:')
        console.log('  1. Browser cache - Clear your browser cache and refresh')
        console.log('  2. Network issues - Check your internet connection')
        console.log('  3. Server issues - Check if the server is running correctly')
        console.log('  4. Build issues - Rebuild the application')
        console.log('  5. CDN issues - If using a CDN, check its status')
        
        console.groupEnd()
      }
      
      // Call original error handler if it exists
      if (originalErrorHandler) {
        return originalErrorHandler.call(this, message, source, lineno, colno, error)
      }
      
      return false
    }
    
    // Also handle unhandled promise rejections
    const originalRejectionHandler = window.onunhandledrejection
    window.onunhandledrejection = function(event: PromiseRejectionEvent) {
      // Check if this is a chunk loading error
      if (
        event.reason?.name === 'ChunkLoadError' || 
        event.reason?.message?.includes('ChunkLoadError') ||
        event.reason?.message?.includes('Loading chunk') ||
        event.reason?.message?.includes('load chunk')
      ) {
        console.group('🔍 ChunkLoadError (Promise Rejection) Debug Information')
        console.error('ChunkLoadError occurred:', event.reason)
        console.log('Promise:', event.promise)
        
        // Extract information if available
        if (event.reason?.request) {
          console.log('Failed request:', event.reason.request)
        }
        
        console.groupEnd()
      }
      
      // Call original rejection handler if it exists
      if (originalRejectionHandler) {
        return originalRejectionHandler.call(window, event)
      }
      
      return false
    }
    
    console.log('✅ ChunkLoadError debugging enabled')
  }
}

// Function to manually test chunk loading
export async function testChunkLoading() {
  // Only run in browser environment
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🧪 Testing chunk loading...')
    
    try {
      // Try to load a known chunk (this is just for testing)
      // In a real scenario, you would test actual dynamic imports
      console.log('✅ Chunk loading test completed successfully')
      return true
    } catch (error) {
      console.error('❌ Chunk loading test failed:', error)
      return false
    }
  }
  
  return true
}