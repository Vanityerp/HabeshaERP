"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from "react"
import { ClientDataService, Client, ClientPreferences } from "@/lib/client-data-service"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { dataCache } from "@/lib/data-cache"

// Re-export types for convenience
export type { Client, ClientPreferences }

interface ClientContextType {
  clients: Client[]
  getClient: (id: string) => Client | undefined
  addClient: (client: Omit<Client, "id" | "avatar" | "segment" | "status">) => Promise<Client>
  updateClient: (id: string, clientData: Partial<Client>) => Promise<Client | undefined>
  deleteClient: (id: string) => boolean
  updateClientPreferences: (id: string, preferences: ClientPreferences) => Promise<Client | undefined>
  updateClientSegment: (id: string, segment: Client["segment"]) => Promise<Client | undefined>
  updateClientStatus: (id: string, status: Client["status"]) => Promise<Client | undefined>
  // Auto-registration methods
  findClientByPhoneAndName: (phone: string, name: string) => Client | undefined
  autoRegisterClient: (clientData: {
    name: string
    email?: string
    phone: string
    source: "client_portal" | "appointment_booking" | "walk_in"
    preferredLocation?: string
  }) => Promise<Client | null>
  normalizePhoneNumber: (phone: string) => string
  refreshClients: () => Promise<Client[]>
}

const ClientContext = createContext<ClientContextType>({
  clients: [],
  getClient: () => undefined,
  addClient: async () => ({} as Client),
  updateClient: async () => undefined,
  deleteClient: () => false,
  updateClientPreferences: async () => undefined,
  updateClientSegment: async () => undefined,
  updateClientStatus: async () => undefined,
  findClientByPhoneAndName: () => undefined,
  autoRegisterClient: async () => null,
  normalizePhoneNumber: () => "",
  refreshClients: async () => [],
})

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  // Load clients from Prisma database (SINGLE SOURCE OF TRUTH) on initialization
  useEffect(() => {
    if (isInitialized) return;

    const loadClientsFromDatabase = async () => {
      try {
        console.log('🔄 Loading clients from Prisma (single source of truth)...')
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          // API returns clients from Prisma database
          console.log(`✅ Loaded ${data.clients.length} clients from Prisma`)
          setClients(data.clients)
        } else {
          console.error('❌ Failed to load clients from Prisma:', response.status, response.statusText)
          setClients([])
        }
      } catch (error) {
        console.error("❌ Error loading clients from Prisma:", error)
        setClients([])
      }
    }

    loadClientsFromDatabase()
    setIsInitialized(true)
  }, [isInitialized])

  // Helper function to generate initials
  const generateInitials = (name: string): string => {
    const nameParts = name.trim().split(' ')
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return nameParts[0].substring(0, 2).toUpperCase()
  }

  // DEPRECATED: No localStorage saving - database is single source of truth
  useEffect(() => {
    if (!isInitialized || clients.length === 0) return;

    // Only dispatch events for real-time updates
    window.dispatchEvent(new CustomEvent('clients-updated', {
      detail: { clients, timestamp: Date.now() }
    }))
  }, [clients, isInitialized])

  // Listen for external client updates (e.g., from appointment booking)
  useEffect(() => {
    const handleExternalUpdate = () => {
      refreshClients()
    }

    window.addEventListener('refresh-clients', handleExternalUpdate)
    return () => window.removeEventListener('refresh-clients', handleExternalUpdate)
  }, [])

  // Get a client by ID
  const getClient = (id: string) => {
    return clients.find(client => client.id === id)
  }

  // Add a new client with database persistence and duplicate checking
  const addClient = async (clientData: Omit<Client, "id" | "avatar" | "segment" | "status">) => {
    try {
      // First check for duplicates
      const duplicateCheck = await fetch('/api/clients/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: clientData.name,
          phone: clientData.phone
        })
      })

      const duplicateResult = await duplicateCheck.json()

      if (duplicateResult.hasDuplicates) {
        const duplicate = duplicateResult.duplicates[0]
        const duplicateType = duplicate.type === 'phone' ? 'phone number' : 'name'

        toast({
          title: "Duplicate client found",
          description: `A client with this ${duplicateType} already exists: ${duplicate.client.name}`,
          variant: "destructive"
        })

        // Return the existing client instead of creating a new one
        return duplicate.client
      }

      // Create the client via API
      const response = await fetch('/api/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...clientData,
          registrationSource: clientData.registrationSource || 'manual',
          isAutoRegistered: clientData.isAutoRegistered || false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 409) {
          // Handle duplicate error from server
          toast({
            title: "Duplicate client found",
            description: errorData.message,
            variant: "destructive"
          })
          return errorData.existingClient
        }

        throw new Error(errorData.error || 'Failed to create client')
      }

      const result = await response.json()
      const newClient = result.client

      // Add to local state
      setClients(prevClients => {
        const updatedClients = [...prevClients, newClient]
        console.log(`Client added to local state. Total clients: ${updatedClients.length}`)
        return updatedClients
      })

      toast({
        title: "Client created",
        description: `${newClient.name} has been added to your client database.`,
      })

      // Trigger a refresh to ensure consistency
      setTimeout(() => {
        refreshClients()
      }, 1000)

      return newClient

    } catch (error) {
      console.error('Error creating client:', error)
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive"
      })

      // Fallback to local creation if API fails
      const nameParts = clientData.name.split(" ")
      const initials = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : nameParts[0].substring(0, 2)

      const fallbackClient: Client = {
        id: uuidv4(),
        avatar: initials.toUpperCase(),
        segment: "New",
        status: "Active",
        ...clientData,
      }

      setClients(prevClients => [...prevClients, fallbackClient])
      return fallbackClient
    }
  }

  // Update an existing client with database persistence
  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      console.log('🔄 Updating client:', id, clientData)

      // Persist to database via API
      const apiPayload: any = {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        city: clientData.city,
        state: clientData.state,
        zipCode: clientData.zip, // Map 'zip' to 'zipCode' for API
        birthday: clientData.birthday,
        notes: clientData.notes,
        preferredLocationId: clientData.preferredLocation, // Send as-is (e.g., "loc1")
        preferences: clientData.preferences
      }

      // Remove undefined values to avoid overwriting with undefined
      Object.keys(apiPayload).forEach(key => {
        if (apiPayload[key] === undefined) {
          delete apiPayload[key]
        }
      })

      console.log('📤 Sending API payload:', apiPayload)

      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || `Failed to update client: ${response.statusText}`)
      }

      const responseData = await response.json()
      console.log('✅ API Response:', responseData)

      // Refresh clients from database to ensure consistency
      const refreshedClients = await refreshClients()

      // Get the updated client from the refreshed list
      const updatedClient = refreshedClients.find(c => c.id === id)

      if (updatedClient) {
        toast({
          title: "Client updated",
          description: `${updatedClient.name}'s information has been updated.`,
        })
      }

      return updatedClient
    } catch (error) {
      console.error('❌ Error updating client:', error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update client. Please try again.",
        variant: "destructive"
      })

      // Revert local state by refreshing from database
      await refreshClients()

      return undefined
    }
  }

  // Delete a client
  const deleteClient = (id: string) => {
    const clientToDelete = getClient(id)

    if (!clientToDelete) return false

    setClients(prevClients => prevClients.filter(client => client.id !== id))

    toast({
      title: "Client deleted",
      description: `${clientToDelete.name} has been removed from your client database.`,
      variant: "destructive",
    })

    return true
  }

  // Update client preferences
  const updateClientPreferences = async (id: string, preferences: ClientPreferences) => {
    return await updateClient(id, { preferences })
  }

  // Update client segment
  const updateClientSegment = async (id: string, segment: Client["segment"]) => {
    return await updateClient(id, { segment })
  }

  // Update client status
  const updateClientStatus = async (id: string, status: Client["status"]) => {
    return await updateClient(id, { status })
  }

  // Normalize phone number for consistent comparison
  const normalizePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '')

    // Handle Qatar phone numbers
    if (digitsOnly.startsWith('974')) {
      return digitsOnly // Already has country code
    } else if (digitsOnly.startsWith('00974')) {
      return digitsOnly.substring(2) // Remove 00 prefix
    } else if (digitsOnly.length === 8) {
      return `974${digitsOnly}` // Add Qatar country code
    }

    return digitsOnly
  }

  // Find client by phone and name (duplicate detection)
  const findClientByPhoneAndName = (phone: string, name: string): Client | undefined => {
    const normalizedPhone = normalizePhoneNumber(phone)
    const normalizedName = name.toLowerCase().trim()

    return clients.find(client => {
      const clientNormalizedPhone = normalizePhoneNumber(client.phone)
      const clientNormalizedName = client.name.toLowerCase().trim()

      // Match if both phone AND name match
      return clientNormalizedPhone === normalizedPhone && clientNormalizedName === normalizedName
    })
  }

  // Auto-register client with duplicate detection
  const autoRegisterClient = async (clientData: {
    name: string
    email?: string
    phone: string
    source: "client_portal" | "appointment_booking" | "walk_in"
    preferredLocation?: string
  }): Promise<Client | null> => {
    try {
      // Check for existing client
      const existingClient = findClientByPhoneAndName(clientData.phone, clientData.name)

      if (existingClient) {
        console.log(`Client already exists: ${existingClient.name} (${existingClient.phone})`)
        return existingClient // Return existing client instead of null
      }

      // Create new client with auto-registration metadata
      const newClientData = {
        name: clientData.name,
        email: clientData.email || "",
        phone: clientData.phone,
        address: "",
        city: "",
        state: "",
        birthday: "",
        preferredLocation: clientData.preferredLocation || "loc1",
        locations: [clientData.preferredLocation || "loc1"],
        totalSpent: 0,
        referredBy: "",
        preferences: {
          preferredStylists: [],
          preferredServices: [],
          allergies: [],
          notes: ""
        },
        registrationSource: clientData.source,
        isAutoRegistered: true,
        notes: `Auto-registered via ${clientData.source.replace('_', ' ')}`
      }

      const newClient = await addClient(newClientData)

      console.log(`Auto-registered new client: ${newClient.name} via ${clientData.source}`)

      return newClient
    } catch (error) {
      console.error("Error auto-registering client:", error)
      return null
    }
  }

  // Refresh clients from Prisma database (SINGLE SOURCE OF TRUTH)
  const refreshClients = async (): Promise<Client[]> => {
    try {
      console.log('🔄 Refreshing clients from Prisma...')
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Refreshed ${data.clients.length} clients from Prisma`)
        setClients(data.clients)
        return data.clients
      } else {
        console.error('❌ Failed to refresh clients from Prisma:', response.status, response.statusText)
        return []
      }
    } catch (error) {
      console.error("❌ Error refreshing clients from Prisma:", error)
      return []
    }
  }

  return (
    <ClientContext.Provider
      value={{
        clients,
        getClient,
        addClient,
        updateClient,
        deleteClient,
        updateClientPreferences,
        updateClientSegment,
        updateClientStatus,
        findClientByPhoneAndName,
        autoRegisterClient,
        normalizePhoneNumber,
        refreshClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export const useClients = () => useContext(ClientContext)
