
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "homie-f0700.firebaseapp.com",
  projectId: "homie-f0700",
  storageBucket: "homie-f0700.firebasestorage.app",
  messagingSenderId: "909447294038",
  appId: "1:909447294038:web:027a44892fc40146dadff7"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
