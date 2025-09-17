import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWvRJ8zMcVtJA0Pt_xvmkX0eK59DnsjM",
  authDomain: "primevui-bebasedv11.firebaseapp.com",
  projectId: "primevui-bebasedv11",
  storageBucket: "primevui-bebasedv11.appspot.com",
  messagingSenderId: "706295551856",
  appId: "1:706295551856:web:3fbe6caf8da3c4a5ce21b5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

