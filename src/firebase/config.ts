import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDcZYu7sqgoRMhZrzu5sp7esg6x8X3DfZ0",
  authDomain: "prioritykanban.firebaseapp.com",
  projectId: "prioritykanban",
  storageBucket: "prioritykanban.firebasestorage.app",
  messagingSenderId: "780904204715",
  appId: "1:780904204715:web:568bf15a4beab498606aee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
