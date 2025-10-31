import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import { validateAndSanitizeInput, userLoginSchema } from '../lib/security/validation'

async function testAuthAPI() {
  try {
    console.log('🔍 Testing authentication flow...\n')
    
    const testEmail = 'admin@vanityhub.com'
    const testPassword = 'Admin33#'
    
    // Step 1: Validate input
    console.log('1. Validating input...')
    const validation = validateAndSanitizeInput(userLoginSchema, {
      email: testEmail,
      password: testPassword,
    })
    
    if (!validation.success) {
      console.log('   ❌ Validation failed:', validation.errors)
      return
    }
    console.log('   ✅ Input validation passed\n')
    
    const { email, password } = validation.data
    
    // Step 2: Find user
    console.log('2. Finding user in database...')
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        staffProfile: {
          include: {
            locations: {
              include: {
                location: true
              }
            }
          }
        }
      }
    })
    
    if (!user) {
      console.log('   ❌ User not found')
      return
    }
    console.log('   ✅ User found')
    console.log(`      Email: ${user.email}`)
    console.log(`      Role: ${user.role}`)
    console.log(`      Active: ${user.isActive}\n`)
    
    // Step 3: Check if active
    if (!user.isActive) {
      console.log('   ❌ User account is inactive')
      return
    }
    console.log('3. User is active ✅\n')
    
    // Step 4: Compare passwords
    console.log('4. Comparing passwords...')
    console.log(`   Input password: "${testPassword}"`)
    console.log(`   Hash in DB: ${user.password.substring(0, 29)}...`)
    
    const passwordMatch = await bcrypt.compare(password, user.password)
    console.log(`   Match result: ${passwordMatch ? '✅ MATCH' : '❌ NO MATCH'}\n`)
    
    if (!passwordMatch) {
      console.log('❌ Password does not match!')
      
      // Try alternate test
      console.log('\n5. Testing other common passwords...')
      const testPwds = ['admin123', 'Admin123#', 'admin', 'password']
      for (const pwd of testPwds) {
        const match = await bcrypt.compare(pwd, user.password)
        console.log(`   "${pwd}": ${match ? '✅' : '❌'}`)
        if (match) {
          console.log(`\n✨ Actual password is: "${pwd}"`)
        }
      }
      return
    }
    
    // Step 5: Get locations
    console.log('5. Getting user locations...')
    let locationIds: string[] = []
    if (user.staffProfile?.locations) {
      locationIds = user.staffProfile.locations
        .filter(sl => sl.isActive)
        .map(sl => sl.location.id)
    }
    console.log(`   Locations: ${user.role === 'ADMIN' ? '["all"]' : JSON.stringify(locationIds)}\n`)
    
    // Step 6: Build auth response
    console.log('6. Building authentication response...')
    const authResponse = {
      id: user.id,
      name: user.staffProfile?.name || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      locations: user.role === "ADMIN" ? ["all"] : locationIds,
    }
    console.log('   ✅ Auth response:', JSON.stringify(authResponse, null, 2))
    
    console.log('\n🎉 Authentication flow completed successfully!')
    console.log('\n📋 Working credentials:')
    console.log('   Email: admin@vanityhub.com')
    console.log('   Password: Admin33#')
    
  } catch (error) {
    console.error('\n❌ Error during authentication test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuthAPI()
