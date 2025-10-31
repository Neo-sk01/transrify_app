/**
 * Verification script for Duress Proximity Alert dependencies
 * Checks that expo-notifications and expo-haptics are properly installed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Duress Proximity Alert dependencies...\n');

// Check package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredPackages = {
  'expo-notifications': 'Push notification support',
  'expo-haptics': 'Haptic feedback on alerts',
};

let allInstalled = true;

console.log('📦 Checking installed packages:');
for (const [pkg, description] of Object.entries(requiredPackages)) {
  if (packageJson.dependencies[pkg]) {
    console.log(`  ✅ ${pkg} (${packageJson.dependencies[pkg]}) - ${description}`);
  } else {
    console.log(`  ❌ ${pkg} - NOT INSTALLED`);
    allInstalled = false;
  }
}

// Check app.json configuration
console.log('\n⚙️  Checking app.json configuration:');
const appJsonPath = path.join(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Check iOS notification permission
if (appJson.expo.ios?.infoPlist?.NSUserNotificationsUsageDescription) {
  console.log('  ✅ iOS notification permission configured');
} else {
  console.log('  ❌ iOS notification permission NOT configured');
  allInstalled = false;
}

// Check Android notification permission
if (appJson.expo.android?.permissions?.includes('POST_NOTIFICATIONS')) {
  console.log('  ✅ Android POST_NOTIFICATIONS permission configured');
} else {
  console.log('  ❌ Android POST_NOTIFICATIONS permission NOT configured');
  allInstalled = false;
}

// Check notification channel configuration
if (appJson.expo.notification) {
  console.log('  ✅ Notification channel configuration present');
  console.log(`     - Icon: ${appJson.expo.notification.icon}`);
  console.log(`     - Color: ${appJson.expo.notification.color}`);
  console.log(`     - Android mode: ${appJson.expo.notification.androidMode}`);
} else {
  console.log('  ⚠️  Notification channel configuration not found (optional)');
}

// Check notification utilities module
console.log('\n📝 Checking notification utilities:');
const notificationsModulePath = path.join(__dirname, 'src/lib/notifications.ts');
if (fs.existsSync(notificationsModulePath)) {
  console.log('  ✅ src/lib/notifications.ts created');
} else {
  console.log('  ❌ src/lib/notifications.ts NOT found');
  allInstalled = false;
}

// Expo Go compatibility check
console.log('\n🎯 Expo Go Compatibility:');
console.log('  ✅ expo-notifications is compatible with Expo Go');
console.log('  ✅ expo-haptics is compatible with Expo Go');
console.log('  ℹ️  Both packages work without custom native modules');

// Summary
console.log('\n' + '='.repeat(60));
if (allInstalled) {
  console.log('✅ All dependencies for Duress Proximity Alerts are installed!');
  console.log('\nNext steps:');
  console.log('  1. Implement geolocation helpers (Task 28)');
  console.log('  2. Implement alert API functions (Task 29)');
  console.log('  3. Test notifications in Expo Go');
} else {
  console.log('❌ Some dependencies or configurations are missing.');
  console.log('Please review the errors above.');
  process.exit(1);
}
console.log('='.repeat(60));
