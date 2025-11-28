
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDo_1yB6W-x9Sajji2n13pGN2_CoqX1_oA",
  authDomain: "visionpulse-14a51.firebaseapp.com",
  projectId: "visionpulse-14a51",
  storageBucket: "visionpulse-14a51.appspot.com",
  messagingSenderId: "983103214436",
  appId: "1:983103214436:web:ea42144e76a6b579174579",
  measurementId: "G-PE1M3B09M2"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export { app, firestore };
