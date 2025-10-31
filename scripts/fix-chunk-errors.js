#!/usr/bin/env node

/**
 * Script to fix ChunkLoadError issues
 * 
 * This script helps clear caches and rebuild the application
 * to resolve common ChunkLoadError problems.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function runCommand(command, description) {
  console.log(`\n🔄 ${description}`)
  console.log(`   Command: ${command}\n`)
  
  try {
    const output = execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} completed successfully\n`)
    return true
  } catch (error) {
    console.error(`❌ ${description} failed`)
    console.error(`   Error: ${error.message}\n`)
    return false
  }
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️  Removing ${dirPath}`)
    try {
      fs.rmSync(dirPath, { recursive: true, force: true })
      console.log(`✅ ${dirPath} removed successfully\n`)
      return true
    } catch (error) {
      console.error(`❌ Failed to remove ${dirPath}`)
      console.error(`   Error: ${error.message}\n`)
      return false
    }
  } else {
    console.log(`ℹ️  ${dirPath} does not exist, skipping\n`)
    return true
  }
}

function main() {
  console.log('🔧 ChunkLoadError Fix Script')
  console.log('===========================\n')
  
  // Get the project root directory
  const projectRoot = path.resolve(__dirname, '..')
  console.log(`📂 Project root: ${projectRoot}\n`)
  
  // Step 1: Clear npm cache
  const clearCacheSuccess = runCommand(
    'npm cache clean --force',
    'Clearing npm cache'
  )
  
  if (!clearCacheSuccess) {
    console.log('⚠️  Warning: Failed to clear npm cache, continuing anyway...\n')
  }
  
  // Step 2: Remove .next directory
  const removeNextSuccess = removeDirectory(path.join(projectRoot, '.next'))
  
  // Step 3: Remove node_modules cache
  const removeCacheSuccess = removeDirectory(path.join(projectRoot, 'node_modules', '.cache'))
  
  // Step 4: Remove node_modules (optional, more aggressive)
  console.log('❓ Do you want to remove node_modules? (This will require a full reinstall)')
  console.log('   This is recommended if the above steps don\'t work.')
  console.log('   Type "yes" to remove node_modules, or press Enter to skip:')
  
  // For now, we'll skip this step in the script and let the user decide
  console.log('   Skipping node_modules removal. Run "rm -rf node_modules" manually if needed.\n')
  
  // Step 5: Install dependencies
  const installDepsSuccess = runCommand(
    'npm install --legacy-peer-deps',
    'Installing dependencies'
  )
  
  if (!installDepsSuccess) {
    console.log('❌ Failed to install dependencies')
    process.exit(1)
  }
  
  // Step 6: Build the application
  const buildSuccess = runCommand(
    'npm run build',
    'Building the application'
  )
  
  if (!buildSuccess) {
    console.log('❌ Failed to build the application')
    process.exit(1)
  }
  
  console.log('\n🎉 All steps completed successfully!')
  console.log('\n🚀 To start the application, run:')
  console.log('   npm start\n')
  
  console.log('📝 If you\'re still experiencing ChunkLoadError issues:')
  console.log('   1. Clear your browser cache')
  console.log('   2. Try opening in an incognito/private window')
  console.log('   3. Check the browser console for more detailed error information')
  console.log('   4. Verify that all static assets are being served correctly')
}

// Only run if this script is executed directly (not imported)
if (require.main === module) {
  main()
}

module.exports = {
  runCommand,
  removeDirectory
}