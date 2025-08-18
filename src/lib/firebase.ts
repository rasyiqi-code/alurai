import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "formflow-ai-966kl",
  "appId": "1:584895579440:web:826a8d9f7fddea4756f4f5",
  "storageBucket": "formflow-ai-966kl.appspot.com",
  "apiKey": "AIzaSyBnjIkax1IaFr2YA5cCtmdDs4qySi0kMh0",
  "authDomain": "formflow-ai-966kl.firebaseapp.com",
  "messagingSenderId": "584895579440"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
