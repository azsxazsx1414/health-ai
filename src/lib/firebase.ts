import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnfbqLLjQvhgT_KqyJ5WzF0UpP81pXfoE",
  authDomain: "health-ai-28d09.firebaseapp.com",
  projectId: "health-ai-28d09",
  storageBucket: "health-ai-28d09.firebasestorage.app",
  messagingSenderId: "403136572496",
  appId: "1:403136572496:web:2d9fe92eb8f9a125f97555",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);