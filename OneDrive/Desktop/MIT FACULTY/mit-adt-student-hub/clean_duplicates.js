import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clean() {
  try {
    const querySnapshot = await getDocs(collection(db, "faculty"));
    const seen = new Set();
    let deletedCount = 0;
    
    // We can't await inside forEach safely if we want to track them all nicely, 
    // but deleteDoc returns a promise. We'll collect the promises.
    const deletePromises = [];

    querySnapshot.forEach((document) => {
      const data = document.data();
      // Use name + department as a unique key
      const key = `${data.name}_${data.department}`.toLowerCase().trim();
      
      if (seen.has(key)) {
        console.log(`Deleting duplicate: ${data.name} (${data.department})`);
        deletePromises.push(deleteDoc(document.ref));
        deletedCount++;
      } else {
        seen.add(key);
      }
    });

    await Promise.all(deletePromises);
    console.log(`\nSuccessfully deleted ${deletedCount} duplicate faculty records.`);
    process.exit(0);
  } catch (error) {
    console.error("Error cleaning duplicates:", error);
    process.exit(1);
  }
}

clean();
