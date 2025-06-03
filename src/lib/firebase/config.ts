// Firebase configuration
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDW33ar90-1_DY5pcH90KN_TsvsoM5f0aY",
  authDomain: "bgmi-hub-be0ef.firebaseapp.com",
  projectId: "bgmi-hub-be0ef",
  storageBucket: "bgmi-hub-be0ef.firebasestorage.app",
  messagingSenderId: "937799779250",
  appId: "1:937799779250:web:d5737f427a328d9007daab",
  measurementId: "G-VFT16RQ8V6"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
