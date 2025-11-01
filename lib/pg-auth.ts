import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

export interface User {
  id: string
  email: string
  password: string
  role: string
  isActive: boolean
  staffProfile?: {
    name: string
    locations: Array<{ location: { id: string } }>
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const client = await pool.connect()
  
  try {
    // Query user with staff profile and locations
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.password,
        u.role,
        u."isActive",
        s.name as staff_name,
        json_agg(
          json_build_object(
            'location', json_build_object('id', l.id)
          )
        ) FILTER (WHERE l.id IS NOT NULL) as locations
      FROM users u
      LEFT JOIN staff_members s ON s."userId" = u.id
      LEFT JOIN staff_locations sl ON sl."staffId" = s.id AND sl."isActive" = true
      LEFT JOIN locations l ON l.id = sl."locationId"
      WHERE u.email = $1
      GROUP BY u.id, u.email, u.password, u.role, u."isActive", s.name
    `
    
    const result = await client.query(userQuery, [email.toLowerCase().trim()])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const userData = result.rows[0]
    
    // Check if user is active
    if (!userData.isActive) {
      return null
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.password)
    
    if (!passwordMatch) {
      return null
    }
    
    // Build user object
    const user: User = {
      id: userData.id,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      isActive: userData.isActive,
    }
    
    if (userData.staff_name) {
      user.staffProfile = {
        name: userData.staff_name,
        locations: userData.locations || []
      }
    }
    
    return user
    
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  } finally {
    client.release()
  }
}

export async function updateLastLogin(userId: string): Promise<void> {
  const client = await pool.connect()
  
  try {
    await client.query(
      'UPDATE users SET "lastLogin" = NOW() WHERE id = $1',
      [userId]
    )
  } finally {
    client.release()
  }
}
