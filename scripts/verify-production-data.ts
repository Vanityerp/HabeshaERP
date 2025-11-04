/**
 * Production Data Verification Script
 * 
 * This script verifies that all critical data exists in the production database:
 * - Locations (5 locations)
 * - Staff members (22+ staff)
 * - Services (144+ services)
 * - Clients (any clients)
 * - Products (any products)
 * 
 * Run this after deployment to ensure data is loaded correctly.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface VerificationResult {
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  count?: number
  expected?: number
}

async function verifyProductionData() {
  console.log('🔍 Verifying production database data...\n')
  
  const results: VerificationResult[] = []

  try {
    // 1. Verify Locations
    console.log('📍 Checking locations...')
    const locationCount = await prisma.location.count({
      where: { isActive: true }
    })
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      select: { id: true, name: true }
    })

    if (locationCount >= 5) {
      results.push({
        status: 'PASS',
        message: `Found ${locationCount} locations`,
        count: locationCount,
        expected: 5
      })
      console.log(`  ✅ Found ${locationCount} locations:`, locations.map(l => l.name).join(', '))
    } else {
      results.push({
        status: 'FAIL',
        message: `Only found ${locationCount} locations (expected at least 5)`,
        count: locationCount,
        expected: 5
      })
      console.log(`  ❌ Only found ${locationCount} locations`)
    }

    // 2. Verify Staff Members
    console.log('\n👥 Checking staff members...')
    const staffCount = await prisma.staffMember.count({
      where: { status: 'ACTIVE' }
    })
    const staff = await prisma.staffMember.findMany({
      where: { status: 'ACTIVE' },
      take: 5,
      select: { id: true, name: true }
    })

    if (staffCount >= 20) {
      results.push({
        status: 'PASS',
        message: `Found ${staffCount} active staff members`,
        count: staffCount,
        expected: 20
      })
      console.log(`  ✅ Found ${staffCount} active staff members`)
      console.log(`  Sample: ${staff.map(s => s.name).join(', ')}...`)
    } else {
      results.push({
        status: 'WARNING',
        message: `Found ${staffCount} staff members (expected at least 20)`,
        count: staffCount,
        expected: 20
      })
      console.log(`  ⚠️  Found ${staffCount} staff members`)
    }

    // 3. Verify Services
    console.log('\n💅 Checking services...')
    const serviceCount = await prisma.service.count({
      where: { isActive: true }
    })
    const services = await prisma.service.findMany({
      where: { isActive: true },
      take: 5,
      select: { id: true, name: true, category: true }
    })

    if (serviceCount >= 144) {
      results.push({
        status: 'PASS',
        message: `Found ${serviceCount} active services`,
        count: serviceCount,
        expected: 144
      })
      console.log(`  ✅ Found ${serviceCount} active services`)
      console.log(`  Sample: ${services.map(s => s.name).join(', ')}...`)
    } else {
      results.push({
        status: 'WARNING',
        message: `Found ${serviceCount} services (expected at least 144)`,
        count: serviceCount,
        expected: 144
      })
      console.log(`  ⚠️  Found ${serviceCount} services`)
    }

    // 4. Verify Services are associated with Locations
    console.log('\n🔗 Checking service-location associations...')
    const locationServiceCount = await prisma.locationService.count({
      where: { isActive: true }
    })

    if (locationServiceCount >= 500) {
      results.push({
        status: 'PASS',
        message: `Found ${locationServiceCount} service-location associations`,
        count: locationServiceCount
      })
      console.log(`  ✅ Found ${locationServiceCount} service-location associations`)
    } else {
      results.push({
        status: 'WARNING',
        message: `Found ${locationServiceCount} service-location associations (expected at least 500)`,
        count: locationServiceCount
      })
      console.log(`  ⚠️  Found ${locationServiceCount} service-location associations`)
    }

    // 5. Verify Staff-Location Associations
    console.log('\n🔗 Checking staff-location associations...')
    const staffLocationCount = await prisma.staffLocation.count({
      where: { isActive: true }
    })

    if (staffLocationCount >= 20) {
      results.push({
        status: 'PASS',
        message: `Found ${staffLocationCount} staff-location associations`,
        count: staffLocationCount
      })
      console.log(`  ✅ Found ${staffLocationCount} staff-location associations`)
    } else {
      results.push({
        status: 'WARNING',
        message: `Found ${staffLocationCount} staff-location associations`,
        count: staffLocationCount
      })
      console.log(`  ⚠️  Found ${staffLocationCount} staff-location associations`)
    }

    // 6. Verify Clients
    console.log('\n👤 Checking clients...')
    const clientCount = await prisma.client.count()
    
    results.push({
      status: clientCount > 0 ? 'PASS' : 'WARNING',
      message: `Found ${clientCount} clients`,
      count: clientCount
    })
    console.log(`  ${clientCount > 0 ? '✅' : '⚠️'} Found ${clientCount} clients`)

    // 7. Verify Products
    console.log('\n📦 Checking products...')
    const productCount = await prisma.product.count({
      where: { isActive: true }
    })

    results.push({
      status: productCount > 0 ? 'PASS' : 'WARNING',
      message: `Found ${productCount} active products`,
      count: productCount
    })
    console.log(`  ${productCount > 0 ? '✅' : '⚠️'} Found ${productCount} active products`)

    // 8. Verify Admin User
    console.log('\n👑 Checking admin user...')
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' }
    })

    if (admin) {
      results.push({
        status: 'PASS',
        message: 'Admin user exists',
        count: 1
      })
      console.log(`  ✅ Admin user exists: ${admin.email}`)
    } else {
      results.push({
        status: 'FAIL',
        message: 'Admin user not found',
        count: 0
      })
      console.log(`  ❌ Admin user not found`)
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 VERIFICATION SUMMARY')
    console.log('='.repeat(60))
    
    const passed = results.filter(r => r.status === 'PASS').length
    const warnings = results.filter(r => r.status === 'WARNING').length
    const failed = results.filter(r => r.status === 'FAIL').length

    results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌'
      console.log(`${icon} ${result.message}`)
    })

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Passed: ${passed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`❌ Failed: ${failed}`)
    console.log('='.repeat(60))

    if (failed > 0) {
      console.log('\n❌ CRITICAL: Some data is missing. Run seeding script:')
      console.log('   POST /api/seed-production')
      process.exit(1)
    } else if (warnings > 0) {
      console.log('\n⚠️  WARNING: Some data may be incomplete. Consider running seeding.')
      process.exit(0)
    } else {
      console.log('\n✅ All critical data verified successfully!')
      process.exit(0)
    }

  } catch (error) {
    console.error('\n❌ Error during verification:', error)
    console.error('\nDatabase connection may be failing. Check:')
    console.error('  1. DATABASE_URL is set correctly')
    console.error('  2. DIRECT_URL is set correctly')
    console.error('  3. Database is accessible from Vercel')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification
verifyProductionData()

