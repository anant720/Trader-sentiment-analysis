const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const backendUpdatesDir = path.join(rootDir, 'backend', 'updates');

function publishOta() {
  console.log('📦 Starting OTA Package Build...');

  // 1. Ensure backend/updates exists
  if (!fs.existsSync(backendUpdatesDir)) {
    fs.mkdirSync(backendUpdatesDir, { recursive: true });
  }

  // 2. Read package.json for version
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const version = pkg.version;
  const buildId = Date.now().toString();
  const otaVersion = `${version}-${buildId}`;
  
  const zipName = `update-${otaVersion}.zip`;
  const zipPath = path.join(backendUpdatesDir, zipName);
  
  // 3. Zip the dist folder
  const distPath = path.join(rootDir, 'dist');
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found! Please run "npm run build" first.');
    process.exit(1);
  }

  console.log(`🗜️  Zipping dist/ to ${zipName}...`);
  try {
    // In Windows, Compress-Archive handles this
    // We cd into dist so the contents are at the root of the zip
    const cmd = `powershell -NoProfile -Command "Compress-Archive -Path '${distPath}\\*' -DestinationPath '${zipPath}' -Force"`;
    execSync(cmd, { stdio: 'inherit' });
    
    console.log(`✅ Zip created at ${zipPath}`);
    
    // 4. Update updates.json manifest
    const manifestPath = path.join(backendUpdatesDir, 'updates.json');
    const manifest = {
      version: otaVersion,
      url: `/updates/${zipName}`, // relative URL that the backend serves
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Manifest updated with version ${otaVersion}`);
    console.log('🚀 OTA Publish Complete! Your app will download this on next launch.');
  } catch (error) {
    console.error('❌ Failed to zip dist directory:', error.message);
    process.exit(1);
  }
}

publishOta();
