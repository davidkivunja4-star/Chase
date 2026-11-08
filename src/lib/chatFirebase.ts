import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// The requested chat Firebase configuration
export const chatFirebaseConfig = {
  apiKey: "AIzaSyA8T__nDESZZLhPy9xh9PKBZjQOflruVAo",
  authDomain: "chase-monopoly.firebaseapp.com",
  projectId: "chase-monopoly",
  storageBucket: "chase-monopoly.firebasestorage.app",
  messagingSenderId: "357280258280",
  appId: "1:357280258280:web:f1a606f42cedf044f5515d"
};

// Initialize Firebase App specifically named 'chase-monopoly-app' or default
const existingApps = getApps();
const chatApp = existingApps.find(app => app.name === 'chase-monopoly') 
  || (existingApps.length === 0 
      ? initializeApp(chatFirebaseConfig) 
      : initializeApp(chatFirebaseConfig, 'chase-monopoly'));

export const chatDb = getFirestore(chatApp);
export const chatAuth = getAuth(chatApp);

export default chatApp;
