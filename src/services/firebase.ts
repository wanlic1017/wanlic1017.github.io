import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrC3BXV7z41IzJ_2oerBc4YDsqWBVIuQM",
  authDomain: "haerenganz-app.firebaseapp.com",
  projectId: "haerenganz-app",
  storageBucket: "haerenganz-app.firebasestorage.app",
  messagingSenderId: "516721277681",
  appId: "1:516721277681:web:4fd365c690ef0885210750",
};

const app = initializeApp(firebaseConfig);

// ✅ THESE ARE WHAT YOU ACTUALLY NEED
export const auth = getAuth(app);
export const db = getFirestore(app);