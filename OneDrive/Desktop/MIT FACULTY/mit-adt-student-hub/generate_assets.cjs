const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const logoPath = path.join(__dirname, 'src', 'assets', 'arcus_logo.png');
  const iconDest = path.join(__dirname, 'resources', 'icon.png');
  const splashDest = path.join(__dirname, 'resources', 'splash.png');

  if (!fs.existsSync(logoPath)) {
    console.error('Logo not found at:', logoPath);
    return;
  }

  // Generate icon.png (1024x1024)
  await sharp(logoPath)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 } // transparent background
    })
    .toFile(iconDest);
  console.log('Created icon.png');

  // Generate splash.png (2732x2732)
  // Background: #F2F2F7, logo centered 400px wide, "arcus" text below in dark 80px
  
  // Create an SVG for the text "arcus"
  const svgText = `
    <svg width="2732" height="2732">
      <text x="50%" y="65%" font-family="sans-serif" font-weight="bold" font-size="80" fill="#1C1C1E" text-anchor="middle">Arcus</text>
    </svg>
  `;

  // Resize logo for splash to 400px width
  const resizedLogo = await sharp(logoPath)
    .resize(400, null, { fit: 'contain' })
    .toBuffer();

  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 242, g: 242, b: 247, alpha: 1 } // #F2F2F7
    }
  })
  .composite([
    {
      input: resizedLogo,
      gravity: 'center' // Center the logo
    },
    {
      input: Buffer.from(svgText),
      top: 0,
      left: 0
    }
  ])
  .toFile(splashDest);
  
  console.log('Created splash.png');
}

generate().catch(console.error);
