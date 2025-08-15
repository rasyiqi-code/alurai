import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBa60b6Xa869HnjgJCA1DoLE_jp7209vsY",
  authDomain: "alurai-conversational-forms.firebaseapp.com",
  projectId: "alurai-conversational-forms",
  storageBucket: "alurai-conversational-forms.firebasestorage.app",
  messagingSenderId: "513530691493",
  appId: "1:513530691493:web:8a0fc80301d68dc3b1724c"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

export { db };
