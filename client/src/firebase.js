// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-93722.firebaseapp.com",
  projectId: "mern-estate-93722",
  storageBucket: "mern-estate-93722.appspot.com",
  messagingSenderId: "403040271696",
  appId: "1:403040271696:web:9dba8021fa0b911015c055",
};

// Initialize and export Firebase
export const app = initializeApp(firebaseConfig);
