import { getFirestore } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  "projectId": "formflow-ai-966kl",
  "appId": "1:584895579440:web:826a8d9f7fddea4756f4f5",
  "storageBucket": "formflow-ai-966kl.firebasestorage.app",
  "apiKey": "AIzaSyBnjIkax1IaFr2YA5cCtmdDs4qySi0kMh0",
  "authDomain": "formflow-ai-966kl.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "584895579440"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

export { db };
