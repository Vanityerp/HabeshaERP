/**
 * ⚠️ DEPRECATED: This service is no longer used
 *
 * All client data is now managed through Prisma as the SINGLE SOURCE OF TRUTH.
 *
 * DO NOT USE THIS SERVICE FOR ANY NEW CODE.
 *
 * Migration Guide:
 * - Use /api/clients endpoints for client operations
 * - Use lib/services/clients.ts for server-side business logic
 * - Use lib/client-provider.tsx (useClients hook) for client-side state
 *
 * See lib/db-client-deprecation-notice.md for full migration guide.
 */

"use client"

// Client preferences interface
export interface ClientPreferences {
  preferredStylists: string[]
  preferredServices: string[]
  preferredProducts: string[]
  allergies: string[]
  notes: string
}

// Client interface
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zip?: string
  birthday?: string
  lastVisit?: string
  preferredLocation?: string
  locations?: string[]
  status: "Active" | "Inactive" | "Pending"
  avatar?: string
  segment?: "VIP" | "Regular" | "New" | "At Risk"
  totalSpent?: number
  referredBy?: string
  preferences?: ClientPreferences
  notes?: string
  // Auto-registration tracking
  registrationSource?: "manual" | "client_portal" | "appointment_booking" | "walk_in"
  isAutoRegistered?: boolean
  createdAt?: string
  updatedAt?: string
}

// DEPRECATED: All client data is now managed through the database
// Use API endpoints to fetch real client data
const defaultClients: Client[] = []



// DEPRECATED: All localStorage functions removed
// Use API endpoints instead

// Migration function to convert old string preferences to new object structure
function migrateClientPreferences(clients: any[]): Client[] {
  return clients.map(client => {
    // If preferences is a string, convert it to the new object structure
    if (typeof client.preferences === 'string') {
      const oldPreferencesNote = client.preferences
      client.preferences = {
        preferredStylists: [],
        preferredServices: [],
        preferredProducts: [],
        allergies: [],
        notes: oldPreferencesNote
      }
    }
    // If preferences is undefined, initialize with empty structure
    else if (!client.preferences) {
      client.preferences = {
        preferredStylists: [],
        preferredServices: [],
        preferredProducts: [],
        allergies: [],
        notes: ""
      }
    }
    return client as Client
  })
}

/**
 * @deprecated DEPRECATED: ClientDataService is no longer used.
 * Use Prisma as the single source of truth for client data.
 * See lib/db-client-deprecation-notice.md for migration guide.
 */
export const ClientDataService = {
  /**
   * @deprecated Use Prisma database instead. This function does nothing.
   */
  initializeClients: (): Client[] => {
    console.warn("⚠️ DEPRECATED: ClientDataService.initializeClients() does nothing. Clients are managed in Prisma database.")
    return []
  },

  /**
   * @deprecated Use GET /api/clients instead.
   */
  getClients: (): Client[] => {
    console.warn("⚠️ DEPRECATED: ClientDataService.getClients() is deprecated. Use GET /api/clients instead.")
    return []
  },

  /**
   * @deprecated Use GET /api/clients/[id] instead.
   */
  getClientById: (id: string): Client | undefined => {
    console.warn("⚠️ DEPRECATED: ClientDataService.getClientById() is deprecated. Use GET /api/clients/[id] instead.")
    return undefined
  },

  /**
   * @deprecated Use GET /api/clients with location filter instead.
   */
  getClientsByLocation: (locationId: string): Client[] => {
    console.warn("⚠️ DEPRECATED: ClientDataService.getClientsByLocation() is deprecated. Use GET /api/clients?locationId=X instead.")
    return []
  },

  /**
   * @deprecated Use Prisma queries with filters instead.
   */
  getClientsBySegment: (segment: string): Client[] => {
    console.warn("⚠️ DEPRECATED: ClientDataService.getClientsBySegment() is deprecated. Use Prisma queries instead.")
    return []
  },

  /**
   * @deprecated Use GET /api/clients with search parameter instead.
   */
  searchClients: (query: string): Client[] => {
    console.warn("⚠️ DEPRECATED: ClientDataService.searchClients() is deprecated. Use GET /api/clients with search instead.")
    return []
  },

  /**
   * @deprecated Use POST/PUT /api/clients instead.
   */
  saveClients: (clients: Client[]) => {
    console.warn("⚠️ DEPRECATED: ClientDataService.saveClients() is deprecated. Use POST/PUT /api/clients instead.")
  },

  /**
   * @deprecated Use POST /api/clients/create instead.
   */
  addClient: (clientData: Omit<Client, "id" | "createdAt" | "updatedAt">): Client => {
    console.warn("⚠️ DEPRECATED: ClientDataService.addClient() is deprecated. Use POST /api/clients/create instead.")
    return {
      ...clientData,
      id: 'deprecated',
      status: "Active",
      segment: "New",
      locations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  /**
   * @deprecated Use PUT /api/clients/[id] instead.
   */
  updateClient: (id: string, updates: Partial<Client>): Client | null => {
    console.warn("⚠️ DEPRECATED: ClientDataService.updateClient() is deprecated. Use PUT /api/clients/[id] instead.")
    return null
  },

  /**
   * @deprecated Use DELETE /api/clients/[id] instead.
   */
  deleteClient: (id: string): boolean => {
    console.warn("⚠️ DEPRECATED: ClientDataService.deleteClient() is deprecated. Use DELETE /api/clients/[id] instead.")
    return false
  },

  /**
   * @deprecated Use lib/services/clients.ts getClientStats() instead.
   */
  getClientStats: () => {
    console.warn("⚠️ DEPRECATED: ClientDataService.getClientStats() is deprecated. Use lib/services/clients.ts instead.")
    return {
      total: 0,
      active: 0,
      vip: 0,
      regular: 0,
      new: 0,
      totalSpent: 0
    }
  }
}
