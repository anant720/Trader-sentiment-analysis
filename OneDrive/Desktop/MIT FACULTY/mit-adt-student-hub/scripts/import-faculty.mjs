import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Parse service account directly from the backend folder
const serviceAccountPath = path.resolve('backend/mit-adt-student-hub-firebase-adminsdk-fbsvc-c4d8ee22bb.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Missing Service Account Key at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ── Rank detection helpers (Precision Hierarchy) ──────────
function detectRank(name, dept) {
  const n = name.toLowerCase();
  const d = (dept || '').toLowerCase();

  if (d.includes('pro vice chancellor') || n.includes('pro vice chancellor'))
    return { rank: 1, isPVC: true,  isVC: false, isDean: false, isHOD: false };
  if (d.includes('vice chancellor') || n.includes('vice chancellor'))
    return { rank: 2, isPVC: false, isVC: true,  isDean: false, isHOD: false };
  if (d === 'dean' || n.includes('(dean)') || n.includes('dean'))
    return { rank: 3, isPVC: false, isVC: false, isDean: true,  isHOD: false };
  if (n.includes('(hod)') || n.includes('hod)') || n.includes('mca head') || n.includes('pcm/mtech'))
    return { rank: 4, isPVC: false, isVC: false, isDean: false, isHOD: true  };
  return   { rank: 5, isPVC: false, isVC: false, isDean: false, isHOD: false };
}

function cleanDept(dept) {
  return dept.replace(/\s*\)\s*$/, '').trim();
}

function cleanName(raw) {
  return raw.replace(/^[⭐★\s]+/, '').trim();
}

async function runImport() {
  // Removed old client SDK check
  // Db already initialized at the top via admin SDK
  // Try multiple possible locations for the CSV
  const candidates = [
    path.resolve('src/data/faculty_data.csv'),
    path.resolve('faculty_data.csv'),
    path.resolve('../faculty_data.csv'),
  ];
  const csvPath = candidates.find(p => fs.existsSync(p));
  if (!csvPath) {
    console.error('❌ Could not find faculty_data.csv. Tried:\n' + candidates.join('\n'));
    process.exit(1);
  }
  console.log(`📄 Using CSV: ${csvPath}`);
  const raw = fs.readFileSync(csvPath, 'utf8');


  const lines = raw.split(/\r?\n/).filter(Boolean);
  const seen = new Set();
  const facultyList = [];

  console.log(`📂 Parsing ${lines.length - 1} faculty records...`);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { parts.push(current); current = ''; continue; }
      current += char;
    }
    parts.push(current);

    if (parts.length < 3) continue;

    const rawName = parts[0].trim();
    const rawDept = parts[1].trim();
    const cabin   = parts[2].trim();
    const free    = parts[3]?.trim() || '12:40 – 1:40 PM, after 3:30 PM';

    if (!rawName || !rawDept) continue;

    const name = cleanName(rawName);
    const dept = cleanDept(rawDept);

    const key = `${name.toLowerCase()}|${cabin.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hierarchy = detectRank(rawName, dept);
    const cabinUpper = cabin.toUpperCase();
    const floorMatch = cabinUpper.match(/[NS]?(\d)/);
    const floor = floorMatch ? parseInt(floorMatch[1]) : null;
    const wing = cabinUpper.startsWith('S') ? 'South' : cabinUpper.startsWith('N') ? 'North' : 'Other';

    facultyList.push({
      name,
      department: dept,
      cabin,
      freeTimings: free,
      floor,
      wing,
      reportCount: 0,
      ...hierarchy,
      createdAt: new Date().toISOString(),
    });
  }

  console.log(`🚀 Uploading ${facultyList.length} records to Firestore...`);

  const batchSize = 500;
  for (let i = 0; i < facultyList.length; i += batchSize) {
    const batch = db.batch();
    const chunk = facultyList.slice(i, i + batchSize);

    chunk.forEach(f => {
      const docRef = db.collection('faculty').doc();
      batch.set(docRef, f);
    });

    await batch.commit();
    console.log(`✅ Uploaded batch ${i / batchSize + 1} (${chunk.length} entries)`);
  }

  console.log('🎉 Import complete!');
}

runImport().catch(console.error);
