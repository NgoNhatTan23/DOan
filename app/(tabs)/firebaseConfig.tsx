import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIuCCugOmCeuJPRtZ6lHEEG4xfxoPdj_o",
  authDomain: "lab5-7c2da.firebaseapp.com",
  projectId: "lab5-7c2da",
  storageBucket: "lab5-7c2da.appspot.com",
  messagingSenderId: "229499237395",
  appId: "1:229499237395:web:bd3377aef0b3c97223fbe6",
  measurementId: "G-723T8LQFKL"
};
// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
