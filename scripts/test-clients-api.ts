async function testClientsAPI() {
  try {
    console.log('🔍 Testing /api/clients endpoint...\n')

    const response = await fetch('http://localhost:3001/api/clients')
    
    if (!response.ok) {
      console.error(`❌ API returned status ${response.status}`)
      return
    }

    const data = await response.json()
    
    console.log(`✅ API returned ${data.clients.length} clients\n`)

    // Display each client's total spent
    data.clients.forEach((client: any) => {
      console.log(`📋 ${client.name}:`)
      console.log(`   Email: ${client.email}`)
      console.log(`   Phone: ${client.phone}`)
      console.log(`   Total Spent: QAR ${client.totalSpent.toFixed(2)}`)
      console.log(`   Preferred Location: ${client.preferredLocation}`)
      console.log(`   Segment: ${client.segment}`)
      console.log('')
    })

    console.log('✅ Test complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testClientsAPI()

