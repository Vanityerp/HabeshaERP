'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ChunkError {
  message: string
  timestamp: number
}

export function ChunkErrorHandler() {
  const [chunkError, setChunkError] = useState<ChunkError | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      // Check if this is a chunk loading error
      if (
        event.error?.name === 'ChunkLoadError' || 
        event.message?.includes('ChunkLoadError') ||
        event.message?.includes('Loading chunk') ||
        event.message?.includes('load chunk')
      ) {
        console.warn('ChunkLoadError detected:', event)
        
        setChunkError({
          message: event.message,
          timestamp: Date.now()
        })
        
        setIsVisible(true)
        
        // Show toast notification
        toast({
          title: "Application Update Required",
          description: "The application needs to refresh to load the latest updates.",
          variant: "destructive",
        })
      }
    }

    // Listen for unhandled errors
    window.addEventListener('error', handleChunkError)
    
    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkError)
    }
  }, [])

  const handleRefresh = () => {
    // Force a hard refresh to clear cache and reload all resources
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible || !chunkError) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-blue-600">Application Update Required</CardTitle>
          <CardDescription>
            The application needs to refresh to load the latest updates.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We've detected that some application files have been updated. 
            Please refresh the page to ensure you're using the latest version.
          </p>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="w-full"
            >
              Dismiss (not recommended)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}